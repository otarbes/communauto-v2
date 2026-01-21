import createClient from '@/lib/supabase/client';
import type { CommunautoInvoiceData } from '@/types/pdf';

export interface ExtractionRequest {
  filePath: string;
  userId: string;
  fileUploadId: string;
}

export interface ExtractionResponse {
  success: boolean;
  data?: {
    fileUploadId: string;
    tripsCount: number;
    transactionsCount: number;
    totalAmount: number;
    extractedData: CommunautoInvoiceData;
  };
  error?: {
    message: string;
    details?: unknown;
  };
}

/**
 * Client API pour communiquer avec l'Edge Function d'extraction
 */
export class PdfExtractionApiClient {
  private supabase = createClient();

  /**
   * Déclenche l'extraction PDF via Edge Function
   */
  async extractPdfData(request: ExtractionRequest): Promise<ExtractionResponse> {
    try {
      console.log('Calling extract-data-from-file Edge Function with:', request);
      
      const { data, error } = await this.supabase.functions.invoke('extract-data-from-file', {
        body: request,
      });

      if (error) {
        console.error('Edge Function error:', error);
        throw new Error(`Edge Function error: ${error.message}`);
      }

      console.log('Edge Function response:', data);
      return data as ExtractionResponse;
      
    } catch (error) {
      console.error('API client error:', error);
      
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown API error',
          details: error,
        },
      };
    }
  }

  /**
   * Vérifie le statut du traitement d'un fichier
   */
  async checkProcessingStatus(fileUploadId: string): Promise<{
    processed: boolean;
    processedAt?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('file_uploads')
        .select('processed, processed_at')
        .eq('id', fileUploadId)
        .single();

      if (error) {
        throw new Error(`Status check error: ${error.message}`);
      }

      return {
        processed: data.processed || false,
        processedAt: data.processed_at || undefined,
      };
      
    } catch (error) {
      return {
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown status error',
      };
    }
  }

  /**
   * Récupère les erreurs de traitement
   */
  async getProcessingErrors(userId: string): Promise<Array<{
    id: string;
    fileName: string | null;
    errorMessage: string;
    errorDetails: unknown;
    createdAt: string | null;
  }>> {
    try {
      const { data, error } = await this.supabase
        .from('upload_errors')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw new Error(`Error retrieval failed: ${error.message}`);
      }

      return data || [];
      
    } catch (error) {
      console.error('Failed to retrieve processing errors:', error);
      return [];
    }
  }
}

export const pdfExtractionApiClient = new PdfExtractionApiClient();
