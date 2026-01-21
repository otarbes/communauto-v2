import { serve } from 'https://deno.land/std@0.200.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { extractPdfData } from './extract-pdfjs-modular.ts';
import { Database } from './database.ts';
import type { ExtractionRequest, ExtractionResponse, ExtractedInvoice } from './types.ts';
import { format, parse } from 'npm:date-fns';

/**
 * Utilitaires de conversion
 */
function parseFloatOrNull(value: string | null): number {
  return value ? parseFloat(value.replace(',', '.')) : 0;
}

function parseTripDateTime(dateStr: string, billingYear: string): string {
  // Format: "DD/MM HH:mm" -> ISO datetime
  const [datePart, timePart] = dateStr.trim().split(' ');
  const [day, month] = datePart.split('/');

  const paddedDay = day.padStart(2, '0');
  const paddedMonth = month.padStart(2, '0');

  return `${billingYear}-${paddedMonth}-${paddedDay}T${timePart}:00.000Z`;
}

function parseTransactionDate(dateStr: string): string {
  // Format: "DD/MM/YYYY" -> YYYY-MM-DD
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Parse plan expiry date - logique identique communauto-nss
 */
function parsePlanExpiryDate(extractedPlanExpiry: string | null): string | null {
  if (!extractedPlanExpiry) return null;
  
  try {
    // Handle the "Mensuel" case
    if (extractedPlanExpiry.toLowerCase().includes('mensuel')) {
      // For mensuel plans, use null instead of a date
      console.log('Plan is monthly (mensuel), setting plan_expiry to null');
      return null;
    } else {
      // Regular date handling for non-mensuel cases
      // Format attendu: "DD mois YYYY" (ex: "14 juin 2023")
      // Convertir les noms de mois français en anglais pour le parsing
      const frenchToEnglishMonth = {
        'janvier': 'January',
        'février': 'February', 
        'févr': 'February',
        'fév': 'February',
        'mars': 'March',
        'avr': 'April',
        'avril': 'April',
        'mai': 'May',
        'juin': 'June',
        'juillet': 'July',
        'juil': 'July',
        'juil.': 'July',
        'août': 'August',
        'septembre': 'September',
        'sept': 'September',
        'octobre': 'October',
        'oct': 'October',
        'novembre': 'November',
        'nov': 'November',
        'décembre': 'December',
        'déc': 'December'
      };
      
      let dateStr = extractedPlanExpiry;
      // Remplacer le nom du mois français par sa version anglaise
      for (const [french, english] of Object.entries(frenchToEnglishMonth)) {
        if (dateStr.toLowerCase().includes(french)) {
          dateStr = dateStr.toLowerCase().replace(french, english);
          break;
        }
      }
      
      // Remove any periods that might be in the string (like "February.")
      dateStr = dateStr.replace(/\./g, '');
      
      // Normaliser le format pour s'assurer que le jour est sur 2 chiffres
      const [day, ...rest] = dateStr.split(' ');
      const paddedDay = day.padStart(2, '0');
      dateStr = [paddedDay, ...rest].join(' ');
      
      console.log('Normalized date string for parsing:', dateStr);
      
      // Utiliser le format correct pour le parsing
      const planExpiryDate = parse(dateStr, 'dd MMMM yyyy', new Date());
      console.log('Parsed plan expiry date:', planExpiryDate);
      
      return format(planExpiryDate, 'yyyy-MM-dd');
    }
  } catch (err) {
    console.error('Error parsing plan expiry date:', err);
    console.error('Original plan expiry string:', extractedPlanExpiry);
    return null;
  }
}

/**
 * Handler principal de l'Edge Function
 */
serve(async (req: Request): Promise<Response> => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const extractionRequest: ExtractionRequest = await req.json();
    const { filePath, userId, fileUploadId } = extractionRequest;

    if (!filePath || !userId || !fileUploadId) {
      throw new Error('Missing required parameters: filePath, userId, fileUploadId');
    }

    // Initialize Supabase client with service role
    const supabase = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Starting extraction for file: ${filePath}, user: ${userId}`);

    // Mark file as being processed
    const { error: updateError } = await supabase
      .from('file_uploads')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('id', fileUploadId);

    if (updateError) {
      throw new Error(`Failed to update file_uploads: ${updateError.message}`);
    }

    // Download PDF file directly (bucket is private)
    const { data: fileBuffer, error: downloadError } = await supabase.storage
      .from('uploads')
      .download(filePath);

    if (downloadError || !fileBuffer) {
      throw new Error(`Failed to download PDF file: ${downloadError?.message || 'Unknown error'}`);
    }

    console.log(`PDF downloaded successfully, size: ${fileBuffer.size} bytes`);

    // Convert to ArrayBuffer for PDF.js
    const arrayBuffer = await fileBuffer.arrayBuffer();

    // Extract data from PDF using ArrayBuffer
    const extractedData: ExtractedInvoice = await extractPdfData(arrayBuffer, filePath.split('/').pop());
    
    // Extract billing year for date parsing
    const billingYear = extractedData.billing_period.match(/\d{4}$/)?.[0] || 
                       new Date().getFullYear().toString();

    console.log(`Extracted data: ${extractedData.trips.length} trips, ${extractedData.transactions.length} transactions`);

    // Save extracted data to database
    try {
      // Update file_uploads with extracted metadata
      const { error: fileUpdateError } = await supabase
        .from('file_uploads')
        .update({
          account_number: extractedData.account_number,
          billing_period: extractedData.billing_period,
          invoice_number: extractedData.invoice_number,
          current_plan: extractedData.current_plan,
          plan_expiry: parsePlanExpiryDate(extractedData.plan_expiry),
          total_amount: parseFloatOrNull(extractedData.total_amount),
        })
        .eq('id', fileUploadId);

      if (fileUpdateError) {
        throw new Error(`Failed to update file metadata: ${fileUpdateError.message}`);
      }

      // Insert trips
      if (extractedData.trips.length > 0) {
        const tripsToInsert = extractedData.trips.map(trip => ({
          file_upload_id: fileUploadId,
          user_id: userId,
          vehicle_number: trip.vehicle_number,
          user_number: trip.user_number,
          start_datetime: parseTripDateTime(trip.start_datetime, billingYear),
          end_datetime: parseTripDateTime(trip.end_datetime, billingYear),
          days: trip.days,
          hours: trip.hours,
          time_price: parseFloatOrNull(trip.time_price),
          km: parseFloatOrNull(trip.km),
          km_price: parseFloatOrNull(trip.km_price),
          reservation_fee: parseFloatOrNull(trip.reservation_fee),
          other_fee_credit: parseFloatOrNull(trip.other_fee_credit),
          description: trip.description,
          total_due: parseFloatOrNull(trip.total_due),
          rate_applied: trip.rate_applied,
          purchase_credit: parseFloatOrNull(trip.purchase_credit),
          note: trip.note,
          billing_period: extractedData.billing_period,
          invoice_number: extractedData.invoice_number,
        }));

        const { error: tripsError } = await supabase
          .from('trips')
          .insert(tripsToInsert);

        if (tripsError) {
          throw new Error(`Failed to insert trips: ${tripsError.message}`);
        }
      }

      // Insert transactions
      if (extractedData.transactions.length > 0) {
        const transactionsToInsert = extractedData.transactions.map(transaction => ({
          file_upload_id: fileUploadId,
          user_id: userId,
          user_number: transaction.user_number,
          transaction_date: parseTransactionDate(transaction.transaction_date),
          type: transaction.type,
          description: transaction.description,
          cost: parseFloatOrNull(transaction.cost),
          tps: parseFloatOrNull(transaction.tps),
          tvq: parseFloatOrNull(transaction.tvq),
          total: parseFloatOrNull(transaction.total),
        }));

        const { error: transactionsError } = await supabase
          .from('transactions')
          .insert(transactionsToInsert);

        if (transactionsError) {
          throw new Error(`Failed to insert transactions: ${transactionsError.message}`);
        }
      }

      // Insert balance summary
      const { error: balanceError } = await supabase
        .from('balance_summary')
        .insert({
          file_upload_id: fileUploadId,
          user_id: userId,
          previous_balance: parseFloatOrNull(extractedData.balance.previous_balance),
          payments: parseFloatOrNull(extractedData.balance.payments),
          remaining_balance: parseFloatOrNull(extractedData.balance.remaining_balance),
          late_interest: parseFloatOrNull(extractedData.balance.late_interest),
          trips_total: parseFloatOrNull(extractedData.balance.trips_total),
          tps: parseFloatOrNull(extractedData.balance.tps),
          tvq: parseFloatOrNull(extractedData.balance.tvq),
          purchase_credits: parseFloatOrNull(extractedData.balance.purchase_credits),
          other_transactions: parseFloatOrNull(extractedData.balance.other_transactions),
          new_period_total: parseFloatOrNull(extractedData.balance.new_period_total),
          new_balance: parseFloatOrNull(extractedData.balance.new_balance),
        });

      if (balanceError) {
        throw new Error(`Failed to insert balance summary: ${balanceError.message}`);
      }

      console.log(`Successfully extracted and saved data for file ${fileUploadId}`);

      // Return successful response
      const response: ExtractionResponse = {
        success: true,
        data: {
          fileUploadId,
          tripsCount: extractedData.trips.length,
          transactionsCount: extractedData.transactions.length,
          totalAmount: parseFloatOrNull(extractedData.total_amount),
          extractedData,
        },
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });

    } catch (dbError) {
      throw dbError;
    }

  } catch (error) {
    console.error('Extraction error:', error);

    // Log error to database if possible
    try {
      const supabase = createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase.from('upload_errors').insert({
        error_message: error.message || 'Unknown extraction error',
        error_details: { stack: error.stack, timestamp: new Date().toISOString() },
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    const errorResponse: ExtractionResponse = {
      success: false,
      error: {
        message: error.message || 'Extraction failed',
        details: error.stack,
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
