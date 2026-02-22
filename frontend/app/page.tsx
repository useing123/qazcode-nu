'use client';

import { useState } from 'react';
import { mockPatients, ragDocuments, analysisRecommendations } from '@/lib/mock-data';
import { PatientSelector } from '@/components/patient-selector';
import { PatientCard } from '@/components/patient-card';
import { DiagnosisForm } from '@/components/diagnosis-form';
import { RAGResults } from '@/components/rag-results';
import { AIAnalysis } from '@/components/ai-analysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Activity, BarChart3 } from 'lucide-react';

export default function Home() {
  const [selectedPatient, setSelectedPatient] = useState(mockPatients[0]);
  const [diagnosis, setDiagnosis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleDiagnosisSubmit = (symptoms: string, additionalInfo: string) => {
    setIsAnalyzing(true);
    setShowResults(false);

    // Simulate AI analysis delay
    setTimeout(() => {
      // Generate mock diagnosis based on input keywords
      let mockDiagnosis = 'Требуется дополнительное обследование';

      if (symptoms.toLowerCase().includes('головн')) {
        mockDiagnosis = 'Мигрень (предварительный диагноз)';
      } else if (symptoms.toLowerCase().includes('давлен') || symptoms.toLowerCase().includes('гипертензи')) {
        mockDiagnosis = 'Артериальная гипертензия (неконтролируемая)';
      } else if (symptoms.toLowerCase().includes('груд')) {
        mockDiagnosis = 'Ангинозный синдром (требуется ЭКГ)';
      } else if (symptoms.toLowerCase().includes('живот')) {
        mockDiagnosis = 'Абдоминальная боль (уточнение необходимо)';
      } else if (symptoms.toLowerCase().includes('кашл') || symptoms.toLowerCase().includes('дыш')) {
        mockDiagnosis = 'Респираторное заболевание';
      } else if (symptoms.toLowerCase().includes('лихорад')) {
        mockDiagnosis = 'Инфекционное заболевание (ОРВИ/грипп)';
      }

      setDiagnosis(mockDiagnosis);
      setShowResults(true);
      setIsAnalyzing(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MedRAG AI</h1>
                <p className="text-sm text-gray-600">Система диагностической поддержки врачей</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" />
                <span>RAG-система</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span>Мультиагент</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Patient Information */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Patient Selection */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Выбор пациента</CardTitle>
                </CardHeader>
                <CardContent>
                  <PatientSelector
                    patients={mockPatients}
                    selectedPatient={selectedPatient}
                    onSelectPatient={setSelectedPatient}
                  />
                </CardContent>
              </Card>

              {/* Patient Details */}
              {selectedPatient && <PatientCard patient={selectedPatient} />}
            </div>
          </div>

          {/* Right Panel - Diagnosis and Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Diagnosis Form */}
            <DiagnosisForm onSubmit={handleDiagnosisSubmit} isLoading={isAnalyzing} />

            {/* Results Section */}
            {showResults && diagnosis && (
              <div className="space-y-6 animate-fade-in">
                {/* RAG Results */}
                <RAGResults documents={ragDocuments} diagnosis={diagnosis} />

                {/* AI Analysis */}
                <AIAnalysis
                  diagnosis={diagnosis}
                  recommendations={analysisRecommendations}
                  isLoading={false}
                />
              </div>
            )}

            {/* Empty State */}
            {!showResults && (
              <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
                <CardContent className="pt-12 pb-12 text-center">
                  <Brain className="h-12 w-12 text-blue-400 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Готов к анализу</h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    Выберите пациента и опишите его симптомы, чтобы получить диагностические
                    рекомендации на основе медицинской базы знаний и истории пациента.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-white/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Функции</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ RAG-система для поиска документов</li>
                <li>✓ Анализ истории пациента</li>
                <li>✓ Интерпретация лабораторных данных</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Мультиагентная система</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Агент анализа истории</li>
                <li>✓ Агент лабораторных данных</li>
                <li>✓ Агент клинических знаний</li>
                <li>✓ Координирующий агент</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Важно</h4>
              <p className="text-gray-600">
                Система предназначена для поддержки клинического решения. Окончательный диагноз
                устанавливается квалифицированным врачом.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-xs text-gray-600">
            <p>© 2024 MedRAG AI Demo. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
