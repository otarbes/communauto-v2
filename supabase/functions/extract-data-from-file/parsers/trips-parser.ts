import type { ExtractedInvoice, ExtractedTrip, TextItem, Language } from '../types.ts';

/**
 * Parser pour l'extraction des trajets depuis les factures PDF
 * Respecte exactement le parsing de communauto-nss
 */
export class TripsParser {
  private language: Language;
  private langTerms: Record<string, any>;

  constructor(language: Language) {
    this.language = language;
    this.langTerms = language === 'FRENCH' ? FRENCH_TRIP_TERMS : ENGLISH_TRIP_TERMS;
  }

  /**
   * Extrait les trajets d'une page
   */
  async extractTrips(items: TextItem[], extractedData: ExtractedInvoice): Promise<ExtractedTrip[]> {
    const trips: ExtractedTrip[] = [];
    const rows = this.groupItemsByRows(items);
    
    let inTripTable = false;
    let headerFound = false;

    for (let i = 0; i < rows.length; i++) {
      const [y, rowItems] = rows[i];
      const rowText = rowItems.map(item => item.text).join(' ').trim();

      // Detect trip table header
      if (this.isTripTableHeader(rowText)) {
        headerFound = true;
        inTripTable = true;
        console.log('Trip table header found:', rowText);
        continue;
      }

      // If we're in trip table, try to extract trip data
      if (inTripTable && headerFound) {
        // Check if we've reached the end of trip table
        if (this.isEndOfTripTable(rowText)) {
          inTripTable = false;
          continue;
        }

        // Try to extract trip from this row
        const trip = this.extractTripFromRow(rowItems, extractedData);
        if (trip && this.isValidTrip(trip)) {
          trips.push(trip);
          console.log(`Extracted trip: ${trip.vehicle_number} - ${trip.start_datetime}`);
        }
      }
    }

    return trips;
  }

  /**
   * Vérifie si une ligne est l'en-tête du tableau des trajets
   */
  private isTripTableHeader(rowText: string): boolean {
    const lowerText = rowText.toLowerCase();
    
    if (this.language === 'FRENCH') {
      return lowerText.includes('no véh.') && 
             lowerText.includes('no usager') &&
             (lowerText.includes('date début') || lowerText.includes('date fin'));
    } else {
      return lowerText.includes('vehicle #') &&
             lowerText.includes('user #') &&
             (lowerText.includes('start date') || lowerText.includes('end date'));
    }
  }

  /**
   * Vérifie si on a atteint la fin du tableau des trajets
   */
  private isEndOfTripTable(rowText: string): boolean {
    const lowerText = rowText.toLowerCase();
    
    // Common end markers
    const endMarkers = this.language === 'FRENCH' 
      ? ['total trajets', 'sous-total', 'autres transactions', 'solde précédent']
      : ['trip total', 'subtotal', 'other transactions', 'previous balance'];
    
    return endMarkers.some(marker => lowerText.includes(marker));
  }

  /**
   * Extrait un trajet depuis une ligne d'items
   */
  private extractTripFromRow(rowItems: TextItem[], extractedData: ExtractedInvoice): ExtractedTrip | null {
    try {
      // Sort items by x position (left to right)
      const sortedItems = rowItems.sort((a, b) => a.x - b.x);
      
      // Skip if not enough data
      if (sortedItems.length < 8) {
        return null;
      }

      // Map items to expected columns (based on communauto-nss logic)
      let itemIndex = 0;
      
      const trip: ExtractedTrip = {
        vehicle_number: this.getNextValidItem(sortedItems, itemIndex++) || '',
        user_number: this.getNextValidItem(sortedItems, itemIndex++) || '',
        start_datetime: this.getNextValidItem(sortedItems, itemIndex++) || '',
        end_datetime: this.getNextValidItem(sortedItems, itemIndex++) || '',
        days: this.getNextValidItem(sortedItems, itemIndex++) || '0',
        hours: this.getNextValidItem(sortedItems, itemIndex++) || '0',
        time_price: this.cleanAmount(this.getNextValidItem(sortedItems, itemIndex++) || '0'),
        km: this.getNextValidItem(sortedItems, itemIndex++) || '0',
        km_price: this.cleanAmount(this.getNextValidItem(sortedItems, itemIndex++) || '0'),
        reservation_fee: this.cleanAmount(this.getNextValidItem(sortedItems, itemIndex++) || '0'),
        other_fee_credit: this.cleanAmount(this.getNextValidItem(sortedItems, itemIndex++) || '0'),
        description: this.getNextValidItem(sortedItems, itemIndex++) || '',
        total_due: this.cleanAmount(this.getNextValidItem(sortedItems, itemIndex++) || '0'),
        rate_applied: this.getNextValidItem(sortedItems, itemIndex++) || '',
        purchase_credit: this.cleanAmount(this.getNextValidItem(sortedItems, itemIndex++) || '0'),
        note: '',
      };

      // Format dates to standard format
      trip.start_datetime = this.formatTripDateTime(trip.start_datetime, extractedData.billing_period);
      trip.end_datetime = this.formatTripDateTime(trip.end_datetime, extractedData.billing_period);

      return trip;
      
    } catch (error) {
      console.warn('Failed to extract trip from row:', error);
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
   * Formate une date/heure de trajet
   */
  private formatTripDateTime(dateTimeStr: string, billingPeriod: string): string {
    if (!dateTimeStr) return '';
    
    try {
      // If already in full format, return as is
      if (dateTimeStr.includes('/') && dateTimeStr.includes(' ') && dateTimeStr.split('/').length === 3) {
        return dateTimeStr;
      }
      
      // If short format "DD/MM HH:mm", add year from billing period
      if (dateTimeStr.match(/^\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}$/)) {
        const year = this.extractYearFromBillingPeriod(billingPeriod);
        const [datePart, timePart] = dateTimeStr.split(' ');
        const [day, month] = datePart.split('/');
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year} ${timePart}`;
      }
      
      return dateTimeStr;
      
    } catch (error) {
      console.warn('Failed to format trip date time:', error);
      return dateTimeStr;
    }
  }

  /**
   * Extrait l'année de la période de facturation
   */
  private extractYearFromBillingPeriod(billingPeriod: string): string {
    const yearMatch = billingPeriod.match(/\d{4}/);
    return yearMatch ? yearMatch[0] : new Date().getFullYear().toString();
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
   * Vérifie si un trajet est valide
   */
  private isValidTrip(trip: ExtractedTrip): boolean {
    return !!(trip.vehicle_number && 
             trip.user_number && 
             trip.start_datetime && 
             trip.end_datetime &&
             trip.km);
  }
}

// Terms pour les différentes langues
const FRENCH_TRIP_TERMS = {
  headers: {
    vehicleNumber: 'No véh.',
    userNumber: 'No usager',
    startDate: 'Date début',
    endDate: 'Date fin',
    days: 'Nb jrs',
    hours: 'Nb hres',
    timePrice: 'Prix temps',
    km: 'Nb km',
    kmPrice: 'Prix km',
    reservationFee: 'Frais réserv.',
    otherFeeCredit: 'Frais/Crédit',
    description: 'Descr.',
    totalDue: 'Total dû',
    rateApplied: 'Tarif appliqué',
    purchaseCredit: 'Crédit achat',
  },
};

const ENGLISH_TRIP_TERMS = {
  headers: {
    vehicleNumber: 'Vehicle #',
    userNumber: 'User #',
    startDate: 'Start Date',
    endDate: 'End Date',
    days: 'Days',
    hours: 'Hours',
    timePrice: 'Time Price',
    km: 'Km',
    kmPrice: 'Km Price',
    reservationFee: 'Reservation Fee',
    otherFeeCredit: 'Fee/Credit',
    description: 'Desc.',
    totalDue: 'Total Due',
    rateApplied: 'Rate Applied',
    purchaseCredit: 'Purchase Credit',
  },
};
