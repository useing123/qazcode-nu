'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Send, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DiagnosisFormProps {
  onSubmit: (symptoms: string, additionalInfo: string) => void;
  isLoading: boolean;
}

export function DiagnosisForm({ onSubmit, isLoading }: DiagnosisFormProps) {
  const [symptoms, setSymptoms] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const commonSymptoms = [
    'Головная боль',
    'Повышенное давление',
    'Боль в груди',
    'Боль в животе',
    'Кашель',
    'Одышка',
    'Лихорадка',
  ];

  const handleQuickAdd = (symptom: string) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms((prev) => (prev ? prev + ', ' + symptom : symptom));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (symptoms.trim()) {
      onSubmit(symptoms, additionalInfo);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Введите симптомы и жалобы пациента
        </CardTitle>
        <CardDescription>
          Опишите основные симптомы и жалобы. Система проанализирует информацию с учетом истории пациента
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main Symptoms Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Основные симптомы *
            </label>
            <Textarea
              placeholder="Например: пациент жалуется на сильную головную боль, появилась рано утром, сопровождается тошнотой и светобоязнью..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-24 resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Quick Symptom Buttons */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Быстрое добавление:</label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <Button
                  key={symptom}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAdd(symptom)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  + {symptom}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Дополнительная информация (опционально)
            </label>
            <Textarea
              placeholder="Продолжительность симптомов, спровоцирующие факторы, уже проведенное лечение..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-20 resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Alert */}
          <Alert className="border-blue-300 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              Система проведет анализ с учетом истории болезни, текущих препаратов, аллергий и последних анализов пациента.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!symptoms.trim() || isLoading}
              size="lg"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Анализирую...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Проанализировать
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={() => {
                setSymptoms('');
                setAdditionalInfo('');
              }}
            >
              Очистить
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
