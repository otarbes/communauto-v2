import type { ExtractedInvoice, ExtractedBalance, TextItem, Language } from '../types.ts';

/**
 * Parser pour l'extraction du résumé de balance
 * Compatible avec la logique de communauto-nss
 */
export class BalanceParser {
  private language: Language;
  private langTerms: Record<string, any>;

  constructor(language: Language) {
    this.language = language;
    this.langTerms = language === 'FRENCH' ? FRENCH_BALANCE_TERMS : ENGLISH_BALANCE_TERMS;
  }

  /**
   * Extrait le résumé de balance d'une page
   */
  async extractBalanceSummary(items: TextItem[], extractedData: ExtractedInvoice): Promise<void> {
    const allText = items.map(item => item.text).join(' ');
    const rows = this.groupItemsByRows(items);
    
    // Initialize balance if not already done
    if (!extractedData.balance) {
      extractedData.balance = {
        previous_balance: '0.00',
        payments: '0.00',
        remaining_balance: '0.00',
        late_interest: '0.00',
        trips_total: '0.00',
        tps: '0.00',
        tvq: '0.00',
        purchase_credits: '0.00',
        other_transactions: '0.00',
        new_period_total: '0.00',
        new_balance: '0.00',
      };
    }

    // Extract various balance components
    this.extractPreviousBalance(allText, items, extractedData.balance);
    this.extractPayments(allText, items, extractedData.balance);
    this.extractRemainingBalance(allText, items, extractedData.balance);
    this.extractLateInterest(allText, items, extractedData.balance);
    this.extractTripsTotal(allText, items, extractedData.balance);
    this.extractTaxes(allText, items, extractedData.balance);
    this.extractPurchaseCredits(allText, items, extractedData.balance);
    this.extractOtherTransactions(allText, items, extractedData.balance);
    this.extractNewPeriodTotal(allText, items, extractedData.balance);
    this.extractNewBalance(allText, items, extractedData.balance);

    console.log('Balance summary extracted:', extractedData.balance);
  }

  /**
   * Extrait le solde précédent
   */
  private extractPreviousBalance(allText: string, items: TextItem[], balance: ExtractedBalance): void {
    const pattern = this.language === 'FRENCH'
      ? /solde précédent[:\s]*([-+]?[\d,\.]+)/i
      : /previous balance[:\s]*([-+]?[\d,\.]+)/i;
    
    const match = allText.match(pattern);
    if (match) {
      balance.previous_balance = this.cleanAmount(match[1]);
    }
  }

  /**
   * Extrait les paiements
   */
  private extractPayments(allText: string, items: TextItem[], balance: ExtractedBalance): void {
    const pattern = this.language === 'FRENCH'
      ? /paiements?[:\s]*([-+]?[\d,\.]+)/i
      : /payments?[:\s]*([-+]?[\d,\.]+)/i;
    
    const match = allText.match(pattern);
    if (match) {
      balance.payments = this.cleanAmount(match[1]);
    }
  }

  /**
   * Extrait le solde restant
   */
  private extractRemainingBalance(allText: string, items: TextItem[], balance: ExtractedBalance): void {
    const pattern = this.language === 'FRENCH'
      ? /solde restant[:\s]*([-+]?[\d,\.]+)/i
      : /remaining balance[:\s]*([-+]?[\d,\.]+)/i;
    
    const match = allText.match(pattern);
    if (match) {
      balance.remaining_balance = this.cleanAmount(match[1]);
    }
  }

  /**
   * Extrait les intérêts de retard
   */
  private extractLateInterest(allText: string, items: TextItem[], balance: ExtractedBalance): void {
    const pattern = this.language === 'FRENCH'
      ? /intérêt retard[:\s]*([-+]?[\d,\.]+)/i
      : /late interest[:\s]*([-+]?[\d,\.]+)/i;
    
    const match = allText.match(pattern);
    if (match) {
      balance.late_interest = this.cleanAmount(match[1]);
    }
  }

  /**
   * Extrait le total des trajets
   */
  private extractTripsTotal(allText: string, items: TextItem[], balance: ExtractedBalance): void {
    const pattern = this.language === 'FRENCH'
      ? /total trajets[:\s]*([-+]?[\d,\.]+)/i
      : /trip total[:\s]*([-+]?[\d,\.]+)/i;
    
    const match = allText.match(pattern);
    if (match) {
      balance.trips_total = this.cleanAmount(match[1]);
    }
  }

  /**
   * Extrait les taxes (TPS/TVQ)
   */
  private extractTaxes(allText: string, items: TextItem[], balance: ExtractedBalance): void {
    // TPS/GST
    const tpsPattern = this.language === 'FRENCH'
      ? /tps[:\s]*([-+]?[\d,\.]+)/i
      : /gst[:\s]*([-+]?[\d,\.]+)/i;
    
    const tpsMatch = allText.match(tpsPattern);
    if (tpsMatch) {
      balance.tps = this.cleanAmount(tpsMatch[1]);
    }

    // TVQ/PST
    const tvqPattern = this.language === 'FRENCH'
      ? /tvq[:\s]*([-+]?[\d,\.]+)/i
      : /pst[:\s]*([-+]?[\d,\.]+)/i;
    
    const tvqMatch = allText.match(tvqPattern);
    if (tvqMatch) {
      balance.tvq = this.cleanAmount(tvqMatch[1]);
    }
  }

  /**
   * Extrait les crédits d'achat
   */
  private extractPurchaseCredits(allText: string, items: TextItem[], balance: ExtractedBalance): void {
    const pattern = this.language === 'FRENCH'
      ? /crédits? achat[:\s]*([-+]?[\d,\.]+)/i
      : /purchase credits?[:\s]*([-+]?[\d,\.]+)/i;
    
    const match = allText.match(pattern);
    if (match) {
      balance.purchase_credits = this.cleanAmount(match[1]);
    }
  }

  /**
   * Extrait les autres transactions
   */
  private extractOtherTransactions(allText: string, items: TextItem[], balance: ExtractedBalance): void {
    const pattern = this.language === 'FRENCH'
      ? /autres transactions[:\s]*([-+]?[\d,\.]+)/i
      : /other transactions[:\s]*([-+]?[\d,\.]+)/i;
    
    const match = allText.match(pattern);
    if (match) {
      balance.other_transactions = this.cleanAmount(match[1]);
    }
  }

  /**
   * Extrait le total de la nouvelle période
   */
  private extractNewPeriodTotal(allText: string, items: TextItem[], balance: ExtractedBalance): void {
    const pattern = this.language === 'FRENCH'
      ? /total\s*-\s*nouvelle période[:\s]*([-+]?[\d,\.]+)/i
      : /total\s*-\s*new period[:\s]*([-+]?[\d,\.]+)/i;
    
    const match = allText.match(pattern);
    if (match) {
      balance.new_period_total = this.cleanAmount(match[1]);
    }
  }

  /**
   * Extrait le nouveau solde
   */
  private extractNewBalance(allText: string, items: TextItem[], balance: ExtractedBalance): void {
    const pattern = this.language === 'FRENCH'
      ? /nouveau solde[:\s]*([-+]?[\d,\.]+)/i
      : /new balance[:\s]*([-+]?[\d,\.]+)/i;
    
    const match = allText.match(pattern);
    if (match) {
      balance.new_balance = this.cleanAmount(match[1]);
    }
  }

  /**
   * Nettoie et formate un montant
   */
  private cleanAmount(amountText: string): string {
    if (!amountText) return '0.00';
    return amountText
      .replace(/[^\d,\.\-]/g, '') // Keep digits, commas, dots, and minus
      .replace(',', '.'); // Standardize decimal separator
  }

  /**
   * Groupe les items par lignes (position Y)
   */
  private groupItemsByRows(items: TextItem[]): [string, TextItem[]][] {
    const rows: Record<number, TextItem[]> = {};

    items.forEach(item => {
      const y = Math.round(item.y);
      if (!rows[y]) rows[y] = [];
      rows[y].push(item);
    });

    // Sort by Y position (top to bottom)
    return Object.entries(rows).sort((a, b) => Number(b[0]) - Number(a[0]));
  }
}

// Terms pour les différentes langues
const FRENCH_BALANCE_TERMS = {
  previousBalance: 'solde précédent',
  remainingBalance: 'solde restant',
  lateInterest: 'intérêt retard',
  payments: 'paiements',
  otherTransactions: 'autres transactions',
  newPeriodTotal: 'total - nouvelle période',
  newBalance: 'nouveau solde',
  tripsTotal: 'total trajets',
};

const ENGLISH_BALANCE_TERMS = {
  previousBalance: 'previous balance',
  remainingBalance: 'remaining balance',
  lateInterest: 'late interest',
  payments: 'payments',
  otherTransactions: 'other transactions',
  newPeriodTotal: 'total - new period',
  newBalance: 'new balance',
  tripsTotal: 'trip total',
};
