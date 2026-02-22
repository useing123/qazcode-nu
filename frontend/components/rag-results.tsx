'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, BookOpen } from 'lucide-react';

interface RAGDocument {
  id: string;
  title: string;
  relevance: number;
  content: string;
}

interface RAGResultsProps {
  documents: RAGDocument[];
  diagnosis: string;
}

export function RAGResults({ documents, diagnosis }: RAGResultsProps) {
  const sortedDocs = [...documents].sort((a, b) => b.relevance - a.relevance);

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-100 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5" />
            Релевантные клинические документы
          </CardTitle>
          <CardDescription>Найдено {documents.length} документов по теме: "{diagnosis}"</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {sortedDocs.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm leading-tight">{doc.title}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant="secondary"
                    className={`text-xs font-semibold ${
                      doc.relevance >= 90
                        ? 'bg-emerald-200 text-emerald-800'
                        : doc.relevance >= 80
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {doc.relevance}%
                  </Badge>
                </div>
              </div>

              <div className="pl-8">
                <p className="text-sm text-gray-700 leading-relaxed">{doc.content}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-sm">💡 Совет</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700">
          <p>
            Эти документы были автоматически отобраны на основе релевантности диагнозу, истории пациента и текущему состоянию.
            Всегда используйте клинический опыт и индивидуальный осмотр пациента при принятии решений.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
