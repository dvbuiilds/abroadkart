import type { Student } from '@app/graphql/types';
import {
  stageLabelMap,
  priorityLabelMap,
} from './options';

export function formatTargetCountries(countries: string[] | null | undefined): string {
  if (!countries || countries.length === 0) return 'Not specified';
  return countries.join(', ');
}

export function priorityVariant(priority?: string | null): 'default' | 'secondary' | 'outline' | 'destructive' | 'warning' {
  switch (priority) {
    case 'hot':
      return 'destructive';
    case 'warm':
      return 'warning';
    case 'cold':
      return 'secondary';
    default:
      return 'outline';
  }
}

export function stageLabel(stage?: string | null): string {
  if (!stage) return 'Unknown';
  return stageLabelMap[stage] || stage;
}

export function priorityLabel(priority?: string | null): string {
  if (!priority) return 'Not set';
  return priorityLabelMap[priority] || priority;
}

export function formatStudentName(fullName?: string | null): string {
  return fullName || 'Unknown';
}

export function calculateProfileStrength(student: Partial<Student>): number {
  const totalFields = 20;
  let filledFields = 0;

  const fields: Array<keyof typeof student> = [
    'fullName',
    'email',
    'phone',
    'gender',
    'city',
    'state',
    'qualification',
    'stream',
    'academicScore',
    'yearOfPassing',
    'institutionName',
    'targetCountries',
    'targetCourses',
    'studyLevel',
    'preferredIntake',
    'budgetTuition',
    'budgetLiving',
    'fundingType',
    'passportAvailable',
    'currentStage',
  ];

  fields.forEach((field) => {
    const value = student[field];
    if (value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
      filledFields++;
    }
  });

  return Math.round((filledFields / totalFields) * 100);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Not set';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isStudentReadyForApplication(student: Partial<Student>): boolean {
  const requiredFields = [
    student.fullName,
    student.email,
    student.phone,
    student.qualification,
    student.targetCountries?.length,
    student.studyLevel,
    student.preferredIntake,
    student.budgetTuition,
    student.budgetLiving,
  ];

  return requiredFields.every((field) => field !== null && field !== undefined && field !== '' && field !== 0);
}

export function getInitialsFromName(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
