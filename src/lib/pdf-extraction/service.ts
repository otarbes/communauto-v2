import { createClient } from '@/lib/supabase/client';

/**
 * Service d'extraction PDF
 * Gère l'upload et le traitement des factures Communauto
 */
export class PdfExtractionService {
  private supabase = createClient();

  async uploadFile(file: File, userId: string) {
    // Upload vers Supabase Storage
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    
    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from('invoices')
      .upload(fileName, file);

    if (uploadError) {
      throw new Error(`Erreur upload: ${uploadError.message}`);
    }

    // Déclencher l'extraction via Edge Function
    const { data: extractionData, error: extractionError } = await this.supabase.functions
      .invoke('extract-data-from-file', {
        body: {
          filePath: uploadData.path,
          userId,
        },
      });

    if (extractionError) {
      throw new Error(`Erreur extraction: ${extractionError.message}`);
    }

    return {
      uploadPath: uploadData.path,
      extractionResult: extractionData,
    };
  }

  async getExtractionHistory(userId: string) {
    const { data, error } = await this.supabase
      .from('file_uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur récupération historique: ${error.message}`);
    }

    return data;
  }
}

export const pdfExtractionService = new PdfExtractionService();
