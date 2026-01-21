import { resolvePDFJS } from "https://esm.sh/pdfjs-serverless";
import type { ExtractedInvoice, ExtractedBalance, ExtractedTrip, ExtractedTransaction, TextItem, PDFDocument, PDFPage, Language } from './types.ts';
import { HeaderParser } from './parsers/header-parser.ts';
import { TripsParser } from './parsers/trips-parser.ts';
import { TransactionsParser } from './parsers/transactions-parser.ts';
import { BalanceParser } from './parsers/balance-parser.ts';
import { validateCommunautoFormat } from './validators/communauto-format.ts';

/**
 * Fonction principale d'extraction PDF
 * Compatible avec communauto-nss - Parsing identique
 */
export async function extractPdfData(arrayBuffer: ArrayBuffer, filename?: string): Promise<ExtractedInvoice> {
  try {
    console.log(`Starting PDF extraction from ArrayBuffer, size: ${arrayBuffer.byteLength} bytes`);
    
    const { getDocument } = await resolvePDFJS();
    
    // Load PDF document from ArrayBuffer
    const pdfDocument: PDFDocument = await getDocument({
      data: new Uint8Array(arrayBuffer),
      cMapUrl: "https://unpkg.com/pdfjs-dist@2.16.105/cmaps/",
      cMapPacked: true,
    }).promise;

    console.log(`PDF loaded. Pages: ${pdfDocument.numPages}`);

    // Initialize extracted data structure
    const extractedData: ExtractedInvoice = {
      filename: filename || 'unknown.pdf',
      account_number: '',
      billing_period: '',
      invoice_number: '',
      current_plan: '',
      plan_expiry: '',
      total_amount: '0.00',
      balance: {
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
      },
      trips: [],
      transactions: [],
    };

    // Detect language (French or English)
    const language = await detectLanguage(pdfDocument);
    console.log(`Detected language: ${language}`);

    // Validate PDF format
    const isValidFormat = await validateCommunautoFormat(pdfDocument, language);
    if (!isValidFormat) {
      throw new Error('Invalid Communauto PDF format detected');
    }

    // Initialize parsers
    const headerParser = new HeaderParser(language);
    const tripsParser = new TripsParser(language);
    const transactionsParser = new TransactionsParser(language);
    const balanceParser = new BalanceParser(language);

    // Extract data from each page
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${pdfDocument.numPages}`);
      
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Convert to our TextItem format
      const items: TextItem[] = textContent.items.map((item: any) => ({
        text: item.str || item.text || '',
        x: item.transform[4],
        y: item.transform[5],
        width: item.width || 0,
        height: item.height || 0,
      }));

      // Extract header information (mainly from first page)
      if (pageNum === 1) {
        await headerParser.extractHeaderInfo(items, extractedData);
      }

      // Extract trips from all pages
      const pageTrips = await tripsParser.extractTrips(items, extractedData);
      extractedData.trips.push(...pageTrips);

      // Extract transactions from all pages
      const pageTransactions = await transactionsParser.extractTransactions(items, extractedData);
      extractedData.transactions.push(...pageTransactions);

      // Extract balance summary (usually on last page)
      if (pageNum === pdfDocument.numPages) {
        await balanceParser.extractBalanceSummary(items, extractedData);
      }
    }

    console.log(`Extraction complete. Trips: ${extractedData.trips.length}, Transactions: ${extractedData.transactions.length}`);

    // Final validation
    if (!extractedData.account_number) {
      throw new Error('Could not extract account number from PDF');
    }

    if (!extractedData.billing_period) {
      throw new Error('Could not extract billing period from PDF');
    }

    return extractedData;

  } catch (error) {
    console.error('PDF extraction failed:', error);
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
}

/**
 * Détecte la langue du document PDF
 */
async function detectLanguage(pdfDocument: PDFDocument): Promise<Language> {
  try {
    const firstPage = await pdfDocument.getPage(1);
    const textContent = await firstPage.getTextContent();
    const allText = textContent.items.map((item: any) => item.str || item.text || '').join(' ').toLowerCase();

    // Detect French keywords
    const frenchKeywords = ['no de compte', 'période du', 'relevé', 'forfait courant', 'véhicule'];
    const englishKeywords = ['account number', 'statement', 'period from', 'current plan', 'vehicle'];

    const frenchMatches = frenchKeywords.filter(keyword => allText.includes(keyword)).length;
    const englishMatches = englishKeywords.filter(keyword => allText.includes(keyword)).length;

    return frenchMatches >= englishMatches ? 'FRENCH' : 'ENGLISH';
  } catch (error) {
    console.warn('Language detection failed, defaulting to FRENCH:', error);
    return 'FRENCH';
  }
}
