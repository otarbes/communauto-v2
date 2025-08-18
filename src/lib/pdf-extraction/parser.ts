/**
 * Parser pour les factures PDF Communauto
 * Extracteurs de données spécifiques au format Communauto
 */

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
}

export interface CommunautoTrip {
  id: string;
  startDate: string;
  endDate: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  duration: number;
  vehicleType: string;
  cost: number;
}

export interface CommunautoTransaction {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
}

/**
 * Parse les données brutes extraites du PDF
 */
export function parseInvoiceData(rawData: unknown): CommunautoInvoiceData {
  // TODO: Implémenter le parsing selon le format Communauto
  // Cette logique sera portée depuis communauto-nss
  
  return {
    accountNumber: rawData.accountNumber || '',
    billingPeriod: {
      start: rawData.billingPeriod?.start || '',
      end: rawData.billingPeriod?.end || '',
    },
    trips: rawData.trips || [],
    transactions: rawData.transactions || [],
    summary: {
      totalAmount: rawData.summary?.totalAmount || 0,
      currency: rawData.summary?.currency || 'CAD',
    },
  };
}
