'use client';

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pdfExtractionService, type UploadProgress } from '@/lib/pdf-extraction/service';
import { validateFile } from '@/lib/pdf-extraction/validators';
import { useCurrentUser } from '@/hooks/use-current-user';
import { ExtractionProgress } from './extraction-progress';
import { ExtractionResults } from './extraction-results';
import type { CommunautoInvoiceData } from '@/types/pdf';

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [extractionResult, setExtractionResult] = useState<CommunautoInvoiceData | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: user } = useCurrentUser();

  const resetState = () => {
    setError('');
    setUploadProgress(null);
    setExtractionResult(null);
    setFileName('');
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!user) {
      setError('Vous devez être connecté pour uploader un fichier');
      return;
    }

    setIsUploading(true);
    resetState();
    setFileName(file.name);

    try {
      // Validation du fichier
      validateFile(file);

      // Upload et extraction avec suivi de progression
      const result = await pdfExtractionService.uploadFile(
        file, 
        user.id,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      if (result.success && result.data) {
        setExtractionResult(result.data.extractedData);
        setUploadProgress({
          phase: 'completed',
          progress: 100,
          message: `Extraction terminée: ${result.data.tripsCount} trajets, ${result.data.transactionsCount} transactions`,
        });
      } else {
        throw new Error(result.error?.message || 'Erreur lors de l\'extraction');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du traitement du fichier';
      setError(errorMessage);
      setUploadProgress({
        phase: 'error',
        progress: 0,
        message: 'Erreur lors du traitement',
        error: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const handleInputChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
      // Reset input value to allow re-uploading same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleTryAgain = () => {
    resetState();
    setIsUploading(false);
  };

  // Si on a des résultats, afficher les résultats d'extraction
  if (extractionResult) {
    return (
      <div className="space-y-4">
        <ExtractionResults 
          data={extractionResult} 
          fileName={fileName} 
        />
        <div className="flex justify-center">
          <Button onClick={handleTryAgain} variant="outline">
            Uploader une autre facture
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload de facture Communauto</CardTitle>
          <CardDescription>
            Glissez-déposez votre facture Communauto PDF ou cliquez pour sélectionner.
            Le système extraira automatiquement vos trajets et transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isUploading 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleInputChange}
              disabled={isUploading || !user}
              className="hidden"
              id="file-upload"
            />
            
            {!isUploading ? (
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="space-y-4">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <Button variant="outline" disabled={!user}>
                      Sélectionner un fichier PDF
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Formats acceptés: PDF (max 10MB)
                  </p>
                  {!user && (
                    <p className="text-sm text-red-500">
                      Veuillez vous connecter pour uploader un fichier
                    </p>
                  )}
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                <div className="text-blue-600">
                  <svg className="mx-auto h-12 w-12 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-sm font-medium text-blue-600">
                  Traitement en cours...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Barre de progression */}
      {uploadProgress && (
        <ExtractionProgress progress={uploadProgress} />
      )}
      
      {/* Affichage des erreurs */}
      {error && (
        <Card className="w-full max-w-2xl mx-auto border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="text-red-500">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  {error.includes('déjà été uploadé') ? 'Fichier déjà traité' : 'Erreur lors du traitement'}
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
                {error.includes('déjà été uploadé') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="text-sm text-yellow-800">
                      <strong>Solutions :</strong>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>Sélectionnez un autre fichier PDF</li>
                        <li>Renommez votre fichier avant de l&apos;uploader</li>
                        <li>Vérifiez si les données sont déjà présentes dans votre historique</li>
                      </ul>
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <Button onClick={handleTryAgain} size="sm" variant="outline">
                    {error.includes('déjà été uploadé') ? 'Choisir un autre fichier' : 'Réessayer'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
