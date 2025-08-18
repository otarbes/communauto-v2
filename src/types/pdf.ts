/**
 * Types liés à l'extraction PDF
 */

// Types pour les données extraites des factures Communauto
export interface CommunautoInvoiceData {
  accountNumber: string;
  billingPeriod: {
    start: string;
    end: string;
  };
  trips: CommunautoTrip[];
  transactions: CommunautoTransaction[];
  summary: {
    totalAmount: number;
    currency: string;
  };
  metadata: {
    extractedAt: string;
    fileName: string;
    fileSize: number;
  };
}

export interface CommunautoTrip {
  id: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  endLocation: string;
  distance: number; // en km
  duration: number; // en minutes
  vehicleType: string;
  cost: number;
  fees?: CommunautoTripFee[];
}

export interface CommunautoTripFee {
  type: string;
  description: string;
  amount: number;
}

export interface CommunautoTransaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  category?: string;
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
