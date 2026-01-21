import type { ExtractedInvoice, ExtractedTransaction, TextItem, Language } from '../types.ts';

/**
 * Parser pour l'extraction des transactions financières
 * Compatible avec la logique de communauto-nss
 */
export class TransactionsParser {
  private language: Language;
  private langTerms: Record<string, any>;

  constructor(language: Language) {
    this.language = language;
    this.langTerms = language === 'FRENCH' ? FRENCH_TRANSACTION_TERMS : ENGLISH_TRANSACTION_TERMS;
  }

  /**
   * Extrait les transactions d'une page
   */
  async extractTransactions(items: TextItem[], extractedData: ExtractedInvoice): Promise<ExtractedTransaction[]> {
    const transactions: ExtractedTransaction[] = [];
    const rows = this.groupItemsByRows(items);
    
    let inTransactionTable = false;
    let headerFound = false;

    for (let i = 0; i < rows.length; i++) {
      const [y, rowItems] = rows[i];
      const rowText = rowItems.map(item => item.text).join(' ').trim();

      // Detect transaction table header
      if (this.isTransactionTableHeader(rowText)) {
        headerFound = true;
        inTransactionTable = true;
        console.log('Transaction table header found:', rowText);
        continue;
      }

      // If we're in transaction table, try to extract transaction data
      if (inTransactionTable && headerFound) {
        // Check if we've reached the end of transaction table
        if (this.isEndOfTransactionTable(rowText)) {
          inTransactionTable = false;
          continue;
        }

        // Try to extract transaction from this row
        const transaction = this.extractTransactionFromRow(rowItems);
        if (transaction && this.isValidTransaction(transaction)) {
          transactions.push(transaction);
          console.log(`Extracted transaction: ${transaction.type} - ${transaction.total}`);
        }
      }
    }

    return transactions;
  }

  /**
   * Vérifie si une ligne est l'en-tête du tableau des transactions
   */
  private isTransactionTableHeader(rowText: string): boolean {
    const lowerText = rowText.toLowerCase();
    
    if (this.language === 'FRENCH') {
      return lowerText.includes('no usager') &&
             lowerText.includes('date de transaction') &&
             lowerText.includes('description') &&
             lowerText.includes('coût');
    } else {
      return lowerText.includes('user #') &&
             lowerText.includes('transaction date') &&
             lowerText.includes('description') &&
             lowerText.includes('cost');
    }
  }

  /**
   * Vérifie si on a atteint la fin du tableau des transactions
   */
  private isEndOfTransactionTable(rowText: string): boolean {
    const lowerText = rowText.toLowerCase();
    
    // Common end markers
    const endMarkers = this.language === 'FRENCH'
      ? ['total', 'sous-total', 'nouveau solde', 'balance']
      : ['total', 'subtotal', 'new balance', 'balance'];
    
    return endMarkers.some(marker => lowerText.includes(marker)) &&
           !lowerText.includes('transaction');
  }

  /**
   * Extrait une transaction depuis une ligne d'items
   */
  private extractTransactionFromRow(rowItems: TextItem[]): ExtractedTransaction | null {
    try {
      // Sort items by x position (left to right)
      const sortedItems = rowItems.sort((a, b) => a.x - b.x);
      
      // Skip if not enough data
      if (sortedItems.length < 6) {
        return null;
      }

      // Map items to expected columns
      let itemIndex = 0;
      
      const transaction: ExtractedTransaction = {
        user_number: this.getNextValidItem(sortedItems, itemIndex++) || '',
        transaction_date: this.getNextValidItem(sortedItems, itemIndex++) || '',
        type: this.getNextValidItem(sortedItems, itemIndex++) || '',
        description: this.getNextValidItem(sortedItems, itemIndex++) || '',
        cost: this.cleanAmount(this.getNextValidItem(sortedItems, itemIndex++) || '0'),
        tps: this.cleanAmount(this.getNextValidItem(sortedItems, itemIndex++) || '0'),
        tvq: this.cleanAmount(this.getNextValidItem(sortedItems, itemIndex++) || '0'),
        total: this.cleanAmount(this.getNextValidItem(sortedItems, itemIndex++) || '0'),
      };

      // Format transaction date
      transaction.transaction_date = this.formatTransactionDate(transaction.transaction_date);
      
      // Determine transaction type if not provided
      if (!transaction.type || transaction.type === '') {
        transaction.type = this.determineTransactionType(transaction.description);
      }

      return transaction;
      
    } catch (error) {
      console.warn('Failed to extract transaction from row:', error);
      return null;
    }
  }

  /**
   * Récupère le prochain item valide dans la liste
   */
  private getNextValidItem(items: TextItem[], index: number): string | null {
    if (index >= items.length) return null;
    const text = items[index]?.text?.trim();
    return text && text !== '' ? text : null;
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
   * Formate une date de transaction
   */
  private formatTransactionDate(dateStr: string): string {
    if (!dateStr) return '';
    
    try {
      // If already in DD/MM/YYYY format, return as is
      if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        return dateStr;
      }
      
      // If in DD/MM format, add current year
      if (dateStr.match(/^\d{1,2}\/\d{1,2}$/)) {
        return `${dateStr}/${new Date().getFullYear()}`;
      }
      
      return dateStr;
      
    } catch (error) {
      console.warn('Failed to format transaction date:', error);
      return dateStr;
    }
  }

  /**
   * Détermine le type de transaction en fonction de la description
   */
  private determineTransactionType(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (this.language === 'FRENCH') {
      if (lowerDesc.includes('montant payé') || lowerDesc.includes('paiement')) return 'payment';
      if (lowerDesc.includes('frais annuel')) return 'annual_fee';
      if (lowerDesc.includes('exonération des dommages')) return 'insurance';
      if (lowerDesc.includes('frais admin')) return 'admin_fee';
      if (lowerDesc.includes('contravention')) return 'ticket';
    } else {
      if (lowerDesc.includes('amount paid') || lowerDesc.includes('payment')) return 'payment';
      if (lowerDesc.includes('yearly fee') || lowerDesc.includes('annual fee')) return 'annual_fee';
      if (lowerDesc.includes('damage protection')) return 'insurance';
      if (lowerDesc.includes('admin fee')) return 'admin_fee';
      if (lowerDesc.includes('ticket') || lowerDesc.includes('fine')) return 'ticket';
    }
    
    return 'other';
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

  /**
   * Vérifie si une transaction est valide
   */
  private isValidTransaction(transaction: ExtractedTransaction): boolean {
    return !!(transaction.user_number &&
             transaction.transaction_date &&
             transaction.type &&
             transaction.description &&
             transaction.cost);
  }
}

// Terms pour les différentes langues
const FRENCH_TRANSACTION_TERMS = {
  headers: {
    userNumber: 'No usager',
    transactionDate: 'Date de transaction',
    type: 'Type',
    description: 'Description',
    cost: 'Coût',
    tps: 'TPS',
    tvq: 'TVQ',
    total: 'Total',
  },
  types: {
    payment: 'montant payé',
    annualFee: 'frais annuel',
    damageProtection: 'exonération des dommages',
    adminFee: 'frais admin',
    ticket: 'contravention',
  },
};

const ENGLISH_TRANSACTION_TERMS = {
  headers: {
    userNumber: 'User #',
    transactionDate: 'Transaction Date',
    type: 'Type',
    description: 'Description',
    cost: 'Cost',
    tps: 'GST',
    tvq: 'PST',
    total: 'Total',
  },
  types: {
    payment: 'amount paid',
    annualFee: 'yearly fee',
    damageProtection: 'damage protection',
    adminFee: 'admin fee',
    ticket: 'ticket',
  },
};
