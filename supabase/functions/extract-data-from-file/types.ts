// Types pour l'extraction PDF - Compatible avec communauto-nss

export interface ExtractedInvoice {
  filename: string;
  account_number: string;
  billing_period: string;
  invoice_number: string;
  current_plan: string;
  plan_expiry: string;
  total_amount: string;
  balance: ExtractedBalance;
  trips: ExtractedTrip[];
  transactions: ExtractedTransaction[];
}

export interface ExtractedBalance {
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

export interface ExtractedTrip {
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
  note: string;
}

export interface ExtractedTransaction {
  user_number: string;
  transaction_date: string;
  type: string;
  description: string;
  cost: string;
  tps: string;
  tvq: string;
  total: string;
}

// Types pour PDF.js
export interface TextItem {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PDFDocument {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPage>;
}

export interface PDFPage {
  getTextContent(): Promise<{ items: TextItem[] }>;
}

// Types de réponse pour l'API
export interface ExtractionResponse {
  success: boolean;
  data?: {
    fileUploadId: string;
    tripsCount: number;
    transactionsCount: number;
    totalAmount: number;
    extractedData: ExtractedInvoice;
  };
  error?: {
    message: string;
    details?: unknown;
  };
}

// Types pour les utilitaires
export type Language = 'FRENCH' | 'ENGLISH';

export interface ExtractionRequest {
  filePath: string;
  userId: string;
  fileUploadId: string;
}
