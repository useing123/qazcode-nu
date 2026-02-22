'use client';

import { Patient } from '@/lib/mock-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users } from 'lucide-react';

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
}

export function PatientSelector({
  patients,
  selectedPatient,
  onSelectPatient,
}: PatientSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Users className="h-4 w-4" />
        Выберите пациента
      </label>
      <Select
        value={selectedPatient?.id || ''}
        onValueChange={(id) => {
          const patient = patients.find((p) => p.id === id);
          if (patient) onSelectPatient(patient);
        }}
      >
        <SelectTrigger className="w-full text-base">
          <SelectValue placeholder="Нажмите для выбора пациента..." />
        </SelectTrigger>
        <SelectContent>
          {patients.map((patient) => (
            <SelectItem key={patient.id} value={patient.id}>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{patient.name}</span>
                <span className="text-gray-500">• {patient.age} л.</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
