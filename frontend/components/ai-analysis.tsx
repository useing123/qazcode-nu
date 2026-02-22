'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  AlertCircle,
  Brain,
  Zap,
  TrendingUp,
  Users,
  Calendar,
} from 'lucide-react';

interface RecommendationCategory {
  category: string;
  items: string[];
}

interface AIAnalysisProps {
  diagnosis: string;
  recommendations: RecommendationCategory[];
  isLoading?: boolean;
}

export function AIAnalysis({
  diagnosis,
  recommendations,
  isLoading = false,
}: AIAnalysisProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Анализ мультиагентной системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="animate-pulse flex gap-1">
              <div className="w-2 h-8 bg-purple-400 rounded"></div>
              <div className="w-2 h-8 bg-purple-500 rounded"></div>
              <div className="w-2 h-8 bg-purple-600 rounded"></div>
            </div>
            <p className="text-sm text-gray-600">Анализ информации пациента...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Analysis Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-100 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Анализ мультиагентной системы
          </CardTitle>
          <CardDescription>
            Система проанализировала историю пациента, текущие анализы и релевантные клинические источники
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Diagnosis Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Предварительный диагноз
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
            <p className="text-lg font-semibold text-amber-900">{diagnosis}</p>
            <p className="text-sm text-amber-800 mt-2">
              Диагноз основан на анализе симптомов, истории болезни и текущих лабораторных показателей
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations by Category */}
      <div className="space-y-4">
        {recommendations.map((rec, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {rec.category === 'Диагностика' && (
                  <CheckCircle2 className="h-5 w-5 text-blue-500" />
                )}
                {rec.category === 'Лечение' && (
                  <AlertCircle className="h-5 w-5 text-emerald-500" />
                )}
                {rec.category === 'Мониторинг' && (
                  <TrendingUp className="h-5 w-5 text-cyan-500" />
                )}
                {rec.category === 'Образование пациента' && (
                  <Users className="h-5 w-5 text-pink-500" />
                )}
                {rec.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {rec.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent System Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Как работает система?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-700 space-y-2">
          <p>
            ✓ <strong>Агент анализа истории</strong> - сравнивает текущие симптомы с предыдущими диагнозами и лечением
          </p>
          <p>
            ✓ <strong>Агент лабораторных данных</strong> - анализирует тренды анализов и выявляет отклонения
          </p>
          <p>
            ✓ <strong>Агент клинических знаний</strong> - подбирает релевантные клинические документы и рекомендации
          </p>
          <p>
            ✓ <strong>Координирующий агент</strong> - объединяет информацию и предлагает комплексный план действий
          </p>
        </CardContent>
      </Card>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">⚠️ Важное замечание</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-yellow-800">
          <p>
            Данная система предназначена для поддержки клинического решения врача. Окончательный диагноз и план лечения
            должны быть установлены квалифицированным медицинским специалистом на основе полного обследования пациента.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
