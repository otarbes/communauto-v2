/**
 * Types liés à l'extraction PDF
 * Compatible avec communauto-nss
 */

// Types pour les données extraites des factures Communauto
export interface CommunautoInvoiceData {
  filename: string;
  account_number: string;
  billing_period: string;
  invoice_number: string;
  current_plan: string;
  plan_expiry: string;
  total_amount: string;
  balance: CommunautoBalance;
  trips: CommunautoTrip[];
  transactions: CommunautoTransaction[];
}

export interface CommunautoBalance {
  previous_balance: string;
  payments: string;
  remaining_balance: string;
  late_interest: string;
  trips_total: string;
  tps: string;
  tvq: string;
  purchase_credits: string;
  other_transactions: string;
  new_period_total: string;
  new_balance: string;
}

export interface CommunautoTrip {
  vehicle_number: string;
  user_number: string;
  start_datetime: string;
  end_datetime: string;
  days: string;
  hours: string;
  time_price: string;
  km: string;
  km_price: string;
  reservation_fee: string;
  other_fee_credit: string;
  description: string;
  total_due: string;
  rate_applied: string;
  purchase_credit: string;
  note?: string;
}

export interface CommunautoTransaction {
  user_number: string;
  transaction_date: string;
  type: string;
  description: string;
  cost: string;
  tps: string;
  tvq: string;
  total: string;
}

// Types pour l'upload de fichiers
export interface FileUploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface FileUploadResult {
  success: boolean;
  data?: CommunautoInvoiceData;
  error?: string;
  uploadPath?: string;
}

// Types pour l'historique des extractions
export interface ExtractionHistory {
  id: string;
  fileName: string;
  extractedAt: string;
  tripsCount: number;
  transactionsCount: number;
  totalAmount: number;
  status: 'success' | 'error' | 'processing';
}
