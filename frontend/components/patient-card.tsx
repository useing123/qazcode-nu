'use client';

import { Patient } from '@/lib/mock-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Pill, Activity, Clock } from 'lucide-react';

interface PatientCardProps {
  patient: Patient;
}

export function PatientCard({ patient }: PatientCardProps) {
  return (
    <div className="space-y-4">
      {/* Patient Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{patient.name}</CardTitle>
              <CardDescription className="text-base mt-1">
                {patient.age} лет • {patient.gender}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Allergies Alert */}
      {patient.allergies.length > 0 && (
        <Alert className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 font-semibold">
            ⚠️ Аллергии: {patient.allergies.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Medical History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            История болезни
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {patient.medicalHistory.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Current Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="h-5 w-5" />
            Текущие препараты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {patient.currentMedications.map((med, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                {med}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recent Labs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Последние анализы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patient.recentLabs.map((lab, idx) => {
              const isAbnormal = lab.value && lab.normalRange && !isInRange(lab.value, lab.normalRange);
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    isAbnormal ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">{lab.name}</span>
                    <span className={`text-sm font-bold ${isAbnormal ? 'text-orange-700' : 'text-green-700'}`}>
                      {lab.value} {lab.unit}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">Норма: {lab.normalRange}</div>
                  <div className="text-xs text-gray-500">{lab.date}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Previous Diagnoses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Предыдущие диагнозы</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {patient.previousDiagnoses.map((diag, idx) => (
              <div key={idx} className="border-l-4 border-purple-400 pl-3 py-2">
                <div className="font-semibold text-sm">{diag.diagnosis}</div>
                <div className="text-xs text-gray-600 mt-1">{diag.date}</div>
                <div className="text-xs text-gray-700 mt-1">Лечение: {diag.treatment}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function isInRange(value: string, range: string): boolean {
  // Simple range check for numeric values like "70-100" or "<200"
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return true;

  if (range.includes('-')) {
    const [min, max] = range.split('-').map(Number);
    return numValue >= min && numValue <= max;
  } else if (range.startsWith('<')) {
    return numValue < parseFloat(range.substring(1));
  } else if (range.startsWith('>')) {
    return numValue > parseFloat(range.substring(1));
  }

  return true;
}
