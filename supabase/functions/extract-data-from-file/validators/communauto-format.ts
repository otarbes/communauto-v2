import type { PDFDocument, Language } from '../types.ts';

/**
 * Validation du format strict des factures Communauto
 * S'assure que le PDF correspond au format attendu
 */

/**
 * Valide qu'un PDF respecte le format des factures Communauto
 */
export async function validateCommunautoFormat(
  pdfDocument: PDFDocument,
  language: Language
): Promise<boolean> {
  try {
    console.log('Validating Communauto PDF format...');
    
    // Vérifier le nombre minimum de pages
    if (pdfDocument.numPages < 1) {
      console.error('PDF has no pages');
      return false;
    }

    // Vérifier la première page pour les éléments obligatoires
    const firstPage = await pdfDocument.getPage(1);
    const textContent = await firstPage.getTextContent();
    const allText = textContent.items.map((item: any) => item.str || item.text || '').join(' ').toLowerCase();

    // Éléments obligatoires selon la langue
    const requiredElements = language === 'FRENCH' ? FRENCH_REQUIRED_ELEMENTS : ENGLISH_REQUIRED_ELEMENTS;
    
    // Vérifier la présence des éléments obligatoires
    const missingElements = [];
    
    for (const [key, element] of Object.entries(requiredElements)) {
      if (!allText.includes(element.toLowerCase())) {
        missingElements.push(key);
      }
    }

    if (missingElements.length > 0) {
      console.warn('Missing required elements:', missingElements);
      // Accepter si au moins 70% des éléments sont présents
      const validationRatio = (Object.keys(requiredElements).length - missingElements.length) / Object.keys(requiredElements).length;
      if (validationRatio < 0.7) {
        console.error('Too many missing elements, validation failed');
        return false;
      }
    }

    // Vérifier la structure générale
    const hasValidStructure = await validateDocumentStructure(pdfDocument, language);
    if (!hasValidStructure) {
      console.error('Invalid document structure');
      return false;
    }

    console.log('Communauto PDF format validation successful');
    return true;
    
  } catch (error) {
    console.error('Format validation failed:', error);
    return false;
  }
}

/**
 * Valide la structure générale du document
 */
async function validateDocumentStructure(
  pdfDocument: PDFDocument,
  language: Language
): Promise<boolean> {
  try {
    let hasAccountNumber = false;
    let hasBillingPeriod = false;
    let hasVehicleData = false;
    
    // Vérifier sur toutes les pages
    for (let pageNum = 1; pageNum <= Math.min(pdfDocument.numPages, 3); pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str || item.text || '').join(' ').toLowerCase();

      // Vérifier numéro de compte (5-6 chiffres)
      if (pageText.match(/\d{5,6}/)) {
        hasAccountNumber = true;
      }

      // Vérifier période de facturation
      if (language === 'FRENCH') {
        if (pageText.includes('période') || pageText.includes('au')) {
          hasBillingPeriod = true;
        }
        if (pageText.includes('véh') || pageText.includes('usager')) {
          hasVehicleData = true;
        }
      } else {
        if (pageText.includes('period') || pageText.includes('to')) {
          hasBillingPeriod = true;
        }
        if (pageText.includes('vehicle') || pageText.includes('user')) {
          hasVehicleData = true;
        }
      }
    }

    // Vérifier que les éléments de base sont présents
    if (!hasAccountNumber) {
      console.warn('No account number found in document');
      return false;
    }

    if (!hasBillingPeriod) {
      console.warn('No billing period found in document');
      return false;
    }

    return true;
    
  } catch (error) {
    console.error('Structure validation failed:', error);
    return false;
  }
}

/**
 * Valide l'intégrité des données extraites
 */
export function validateExtractedData(data: any): boolean {
  try {
    // Vérifications de base
    if (!data.account_number || data.account_number.length < 5) {
      console.error('Invalid or missing account number');
      return false;
    }

    if (!data.billing_period || data.billing_period.length < 10) {
      console.error('Invalid or missing billing period');
      return false;
    }

    // Vérifier que les montants sont des nombres valides
    const amounts = [
      data.total_amount,
      data.balance?.previous_balance,
      data.balance?.new_balance
    ].filter(amount => amount !== undefined && amount !== null);

    for (const amount of amounts) {
      const numericAmount = parseFloat(String(amount).replace(',', '.'));
      if (isNaN(numericAmount)) {
        console.error('Invalid amount found:', amount);
        return false;
      }
    }

    console.log('Extracted data validation successful');
    return true;
    
  } catch (error) {
    console.error('Data validation failed:', error);
    return false;
  }
}

// Éléments obligatoires pour validation
const FRENCH_REQUIRED_ELEMENTS = {
  communauto: 'communauto',
  accountOrStatement: 'compte', // "No de compte" ou "Relevé"
  period: 'période',
  vehicle: 'véh',
};

const ENGLISH_REQUIRED_ELEMENTS = {
  communauto: 'communauto',
  accountOrStatement: 'account', // "Account" ou "Statement"
  period: 'period',
  vehicle: 'vehicle',
};
