import createClient from '@/lib/supabase/client';
import type { CommunautoInvoiceData } from '@/types/pdf';

export interface UploadResult {
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

export interface UploadProgress {
  phase: 'uploading' | 'processing' | 'saving' | 'completed' | 'error';
  progress: number; // 0-100
  message: string;
  error?: string;
}

/**
 * Service d'extraction PDF
 * Gère l'upload et le traitement des factures Communauto
 */
export class PdfExtractionService {
  private supabase = createClient();

  /**
   * Upload un fichier PDF et déclenche l'extraction
   */
  async uploadFile(
    file: File, 
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Phase 1: Upload du fichier
      onProgress?.({
        phase: 'uploading',
        progress: 10,
        message: 'Upload du fichier vers le serveur...'
      });

      const fileName = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Erreur upload: ${uploadError.message}`);
      }

      onProgress?.({
        phase: 'uploading',
        progress: 30,
        message: 'Fichier uploadé, création de l\'enregistrement...'
      });

      // Créer l'enregistrement file_uploads
      const { data: fileUploadData, error: fileError } = await this.supabase
        .from('file_uploads')
        .insert({
          user_id: userId,
          filename: file.name,
          file_path: uploadData.path,
          processed: false,
        })
        .select()
        .single();

      if (fileError) {
        // Détecter l'erreur de fichier déjà uploadé
        if (fileError.code === '23505' && fileError.message.includes('file_uploads_filename_user_id_key')) {
          throw new Error(`Ce fichier "${file.name}" a déjà été uploadé et traité. Pour éviter les doublons, veuillez sélectionner un autre fichier ou renommer celui-ci.`);
        }
        throw new Error(`Erreur création enregistrement: ${fileError.message}`);
      }

      onProgress?.({
        phase: 'processing',
        progress: 50,
        message: 'Démarrage de l\'extraction PDF...'
      });

      // Phase 2: Déclencher l'extraction via Edge Function
      const { data: extractionData, error: extractionError } = await this.supabase.functions
        .invoke('extract-data-from-file', {
          body: {
            filePath: uploadData.path,
            userId,
            fileUploadId: fileUploadData.id,
          },
        });

      if (extractionError) {
        throw new Error(`Erreur extraction: ${extractionError.message}`);
      }

      onProgress?.({
        phase: 'saving',
        progress: 80,
        message: 'Sauvegarde des données extraites...'
      });

      // Vérifier le résultat de l'extraction
      if (!extractionData.success) {
        throw new Error(extractionData.error?.message || 'Extraction failed');
      }

      onProgress?.({
        phase: 'completed',
        progress: 100,
        message: `Extraction terminée: ${extractionData.data?.tripsCount || 0} trajets, ${extractionData.data?.transactionsCount || 0} transactions`
      });

      return {
        success: true,
        data: extractionData.data,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      onProgress?.({
        phase: 'error',
        progress: 0,
        message: 'Erreur lors du traitement',
        error: errorMessage,
      });

      return {
        success: false,
        error: {
          message: errorMessage,
          details: error,
        },
      };
    }
  }

  /**
   * Récupère l'historique des extractions
   */
  async getExtractionHistory(userId: string) {
    const { data, error } = await this.supabase
      .from('file_uploads')
      .select(`
        *,
        trips:trips(count),
        transactions:transactions(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur récupération historique: ${error.message}`);
    }

    return data;
  }

  /**
   * Récupère les détails d'un fichier uploadé
   */
  async getFileDetails(fileId: string, userId: string) {
    const { data, error } = await this.supabase
      .from('file_uploads')
      .select(`
        *,
        trips(*),
        transactions(*),
        balance_summary(*)
      `)
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Erreur récupération détails: ${error.message}`);
    }

    return data;
  }

  /**
   * Supprime un fichier et ses données associées
   */
  async deleteFile(fileId: string, userId: string) {
    // Les données associées seront supprimées automatiquement grâce aux contraintes de clé étrangère
    const { error } = await this.supabase
      .from('file_uploads')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Erreur suppression: ${error.message}`);
    }
  }
}

export const pdfExtractionService = new PdfExtractionService();
