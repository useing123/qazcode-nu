"""
Сервер для диагностики заболеваний на основе симптомов.

Использование:
    uvicorn src.llm_server:app --host 127.0.0.1 --port 8000

Docker:
    docker build -t diag-server .
    docker run -p 8000:8000 diag-server

Сервер запускается на http://127.0.0.1:8000/diagnose
"""

from contextlib import asynccontextmanager
from typing import Optional, List
import os
import openai
import json
import re
import asyncio

from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from src.retriever import get_retriever

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n🏥 Сервер Диагностики (FastAPI)")
    print("=" * 40)
    print("Эндпоинт: /diagnose")
    print("Метод:    POST")
    print('Тело:     {"symptoms": "...", "patient_data": {...}}')
    print("Документация: /docs")
    print("=" * 40)
    print("\nНажмите Ctrl+C для остановки\n")
    yield


app = FastAPI(title="Сервер Диагностики", lifespan=lifespan)


class PatientData(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    medicalHistory: Optional[List[str]] = None
    currentMedications: Optional[List[str]] = None
    allergies: Optional[List[str]] = None
    recentLabs: Optional[List[dict]] = None
    previousDiagnoses: Optional[List[dict]] = None

class DiagnoseRequest(BaseModel):
    symptoms: Optional[str] = ""
    patient_data: Optional[PatientData] = None


class Diagnosis(BaseModel):
    rank: int
    diagnosis: str
    icd10_code: str
    explanation: str


class DiagnoseResponse(BaseModel):
    diagnoses: list[Diagnosis]


@app.post("/diagnose", response_model=DiagnoseResponse)
async def handle_diagnose(request: DiagnoseRequest) -> DiagnoseResponse:
    """Обрабатывает POST запросы /diagnose."""
    symptoms = request.symptoms or ""
    patient_data = request.patient_data

    client = openai.AsyncOpenAI(
        base_url="https://hub.qazcode.ai",
        api_key="sk-BDVloWBwHCr5oltlXwyhtA",
    )
    retriever = get_retriever(k=10)
    context = retriever.invoke(symptoms)
    context_str = "\n\n".join([doc.page_content for doc in context])

    print("Извлеченные документы:")
    for doc in context:
        print(doc.metadata["source_file"])

    prompt = f"""Вы — система поддержки принятия клинических решений, обученная на казахстанских клинических протоколах.
Ваша задача — проанализировать симптомы и данные пациента, сопоставить их с информацией из клинических протоколов и предложить до 3 наиболее вероятных диагнозов с кодами по МКБ-10.

ПАЦИЕНТ:
- Симптомы: {symptoms}
"""
    if patient_data:
        prompt += f"- Возраст: {patient_data.age}\n" if patient_data.age else ""
        prompt += f"- Пол: {patient_data.gender}\n" if patient_data.gender else ""
        if patient_data.medicalHistory:
            prompt += f"- История болезни: {', '.join(patient_data.medicalHistory)}\n"
        if patient_data.currentMedications:
            prompt += f"- Текущие препараты: {', '.join(patient_data.currentMedications)}\n"
        if patient_data.allergies:
            prompt += f"- Аллергии: {', '.join(patient_data.allergies)}\n"
        if patient_data.recentLabs:
            prompt += "- Последние анализы:\n"
            for lab in patient_data.recentLabs:
                prompt += f"  - {lab['name']}: {lab['value']} {lab['unit']} (норма: {lab['normalRange']})\n"
        if patient_data.previousDiagnoses:
            prompt += "- Предыдущие диагнозы:\n"
            for diag in patient_data.previousDiagnoses:
                prompt += f"  - {diag['diagnosis']} ({diag['date']})\n"

    prompt += f"""
КОНТЕКСТ ИЗ КЛИНИЧЕСКИХ ПРОТОКОЛОВ:
{context_str}

ЗАДАНИЕ:
1.  Проанализируйте предоставленную информацию.
2.  Определите 3 наиболее вероятных диагноза.
3.  Для каждого диагноза укажите его название, код по МКБ-10 и краткое, но профессиональное обоснование, почему этот диагноз может быть релевантен, основываясь на симптомах, данных пациента и контексте из протоколов.
4.  Ответ верните СТРОГО в формате JSON, без какого-либо дополнительного текста.

ФОРМАТ ОТВЕТА (JSON):
{{
  "diagnoses": [
    {{
      "rank": 1,
      "diagnosis": "Название диагноза",
      "icd10_code": "X00.0",
      "explanation": "Обоснование..."
    }},
    ...
  ]
}}
"""

    for i in range(3):
        try:
            response = await client.chat.completions.create(
                model="oss-120b",
                messages=[
                    {"role": "system", "content": "Вы — система поддержки принятия клинических решений. Ваша задача — помочь в диагностике заболеваний на основе предоставленных данных. Ответ должен быть в формате JSON."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                timeout=30.0,
            )
            diagnoses_data = json.loads(response.choices[0].message.content)["diagnoses"]
            diagnoses = [Diagnosis(**d) for d in diagnoses_data]
            return DiagnoseResponse(diagnoses=diagnoses)
        except (json.JSONDecodeError, KeyError) as e:
            print(f"Попытка {i+1}: Ошибка декодирования JSON: {e}")
            print(f"Ответ LLM: {response.choices[0].message.content if 'response' in locals() else 'No response'}")
        except asyncio.TimeoutError:
            print(f"Попытка {i+1}: Таймаут запроса к API.")
        except Exception as e:
            print(f"Попытка {i+1}: Произошла ошибка: {e}")

    return DiagnoseResponse(diagnoses=[])
