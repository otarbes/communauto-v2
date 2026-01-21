import type { ExtractedInvoice, TextItem, Language } from '../types.ts';

/**
 * Parser pour l'extraction des informations d'en-tête de facture
 * Compatible avec la logique de communauto-nss
 */
export class HeaderParser {
  private language: Language;
  private langTerms: Record<string, any>;

  constructor(language: Language) {
    this.language = language;
    this.langTerms = language === 'FRENCH' ? FRENCH_TERMS : ENGLISH_TERMS;
  }

  /**
   * Extrait les informations d'en-tête du document
   */
  async extractHeaderInfo(items: TextItem[], extractedData: ExtractedInvoice): Promise<void> {
    const allText = items.map(item => item.text).join(' ');
    
    // Extract account number
    if (!extractedData.account_number) {
      extractedData.account_number = this.extractAccountNumber(allText, items) || '';
    }

    // Extract billing period
    if (!extractedData.billing_period) {
      extractedData.billing_period = this.extractBillingPeriod(allText, items) || '';
    }

    // Extract invoice number
    if (!extractedData.invoice_number) {
      extractedData.invoice_number = this.extractInvoiceNumber(allText, items) || '';
    }

    // Extract current plan
    if (!extractedData.current_plan) {
      extractedData.current_plan = this.extractCurrentPlan(allText, items) || '';
    }

    // Extract plan expiry
    if (!extractedData.plan_expiry) {
      extractedData.plan_expiry = this.extractPlanExpiry(allText, items) || '';
    }

    // Extract total amount
    if (!extractedData.total_amount || extractedData.total_amount === '0.00') {
      extractedData.total_amount = this.extractTotalAmount(allText, items) || '0.00';
    }
  }

  /**
   * Extrait le numéro de compte
   */
  private extractAccountNumber(text: string, items: TextItem[]): string | null {
    // Look for account number pattern (5-6 digits)
    const accountMatch = text.match(/(\d{5,6})/);
    if (accountMatch) {
      return accountMatch[1];
    }

    // If not found in text, try to find in items
    const accountItem = items.find((item) => /^\d{5,6}$/.test(item.text.trim()));
    if (accountItem) {
      return accountItem.text.trim();
    }

    return null;
  }

  /**
   * Extrait la période de facturation
   * Compatible avec la logique communauto-nss
   */
  private extractBillingPeriod(text: string, items: TextItem[]): string | null {
    // Chercher "Période du" (français) ou "For the period" (anglais)
    const billingPeriodTerms = this.language === 'FRENCH' 
      ? 'Période du'
      : 'For the period';
    
    if (text.includes(billingPeriodTerms)) {
      // Extraire ce qui suit le terme jusqu'à l'année
      const periodPattern = this.language === 'FRENCH'
        ? new RegExp(`Période du\\s+(.+?\\d{4})`, 'i')
        : new RegExp(`For the period\\s+(.+?\\d{4})`, 'i');
      
      const periodMatch = text.match(periodPattern);
      if (periodMatch) {
        return periodMatch[1].trim();
      }
    }

    // Fallback: Pattern for format "1 avril 2024 au 30 avril 2024"
    const fallbackPattern = this.language === 'FRENCH' 
      ? /(\d{1,2}\s+[a-zéèêë]+\.?\s+\d{4}\s+au\s+\d{1,2}\s+[a-zéèêë]+\.?\s+\d{4})/i
      : /(\d{1,2}\s+[a-z]+\.?\s+\d{4}\s+to\s+\d{1,2}\s+[a-z]+\.?\s+\d{4})/i;
    
    const fallbackMatch = text.match(fallbackPattern);
    if (fallbackMatch) {
      return fallbackMatch[1].trim();
    }

    return null;
  }

  /**
   * Extrait le numéro de facture/relevé
   */
  private extractInvoiceNumber(text: string, items: TextItem[]): string | null {
    const statementPattern = this.language === 'FRENCH'
      ? /relevé\s+#(\d+)/i
      : /statement\s+#(\d+)/i;
    
    const match = text.match(statementPattern);
    return match ? match[1] : null;
  }

  /**
   * Extrait le forfait courant
   */
  private extractCurrentPlan(text: string, items: TextItem[]): string | null {
    const planTypes = this.langTerms.planTypes || [];
    
    for (const planType of planTypes) {
      if (text.toLowerCase().includes(planType.toLowerCase())) {
        return planType;
      }
    }

    return null;
  }

  /**
   * Extrait la date d'expiration du forfait
   */
  private extractPlanExpiry(text: string, items: TextItem[]): string | null {
    // Pattern for date like "14 fév. 2024"
    const datePattern = /(\d{1,2}\s+[a-zéèêë\.]+\.?\s+\d{4})/i;
    const dateMatch = text.match(datePattern);
    
    return dateMatch ? dateMatch[1].trim() : null;
  }

  /**
   * Extrait le montant total
   */
  private extractTotalAmount(text: string, items: TextItem[]): string | null {
    // Filter items with amounts
    const amountItems = items.filter((item) =>
      item.text.match(/\d+[,\.]\d+\$/) || item.text.match(/\$\d+\.\d+/)
    ).map((item) => ({
      text: item.text,
      x: item.x,
      value: parseFloat(this.cleanAmount(item.text).replace(',', '.')),
    }));

    if (amountItems.length > 1) {
      // Sort by x position (rightmost is usually total)
      amountItems.sort((a, b) => b.x - a.x);
      return this.cleanAmount(amountItems[0].text);
    } else if (amountItems.length === 1) {
      return this.cleanAmount(amountItems[0].text);
    }

    return null;
  }

  /**
   * Nettoie et formate un montant
   */
  private cleanAmount(amountText: string): string {
    return amountText
      .replace(/[^\d,\.]/g, '') // Remove non-numeric chars except , and .
      .replace(',', '.'); // Standardize decimal separator
  }
}

// Terms definitions
const FRENCH_TERMS = {
  accountNumber: "No de compte",
  billingPeriod: "Période du",
  statement: "Relevé #",
  currentPlan: "Forfait courant",
  expiry: "Exp. du forfait",
  planTypes: [
    "Économique",
    "Économique Plus",
    "Économique Extra",
    "Liberté",
    "Liberté Plus",
  ],
};

const ENGLISH_TERMS = {
  accountNumber: "Account number",
  billingPeriod: "Period from",
  statement: "Statement #",
  currentPlan: "Current plan",
  expiry: "Plan expires",
  planTypes: [
    "Economical",
    "Economical Plus",
    "Economical Extra",
    "Freedom",
    "Freedom Plus",
  ],
};
