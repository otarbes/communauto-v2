/**
 * Types communs utilisés dans toute l'application
 */

// Types de base
export type UUID = string;
export type Timestamp = string;
export type Currency = 'CAD' | 'USD';

// Types pour les réponses API
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Types pour les états de chargement
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = unknown> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

// Types pour les formulaires
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'file' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface FormError {
  field: string;
  message: string;
}

// Types pour les notifications
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // en ms
}

// Types pour les dates
export interface DateRange {
  start: Date;
  end: Date;
}

export interface DatePeriod {
  label: string;
  value: string;
  range: DateRange;
}
