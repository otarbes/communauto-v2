'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pdfExtractionService } from '@/lib/pdf-extraction/service';
import { validateFile } from '@/lib/pdf-extraction/validators';
import { useCurrentUser } from '@/hooks/use-current-user';

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { data: user } = useCurrentUser();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      // Validation du fichier
      validateFile(file);

      // Upload et extraction
      const result = await pdfExtractionService.uploadFile(file, user.id);
      
      setSuccess(`Fichier traité avec succès ! ${result.extractionResult?.tripsCount || 0} trajets extraits.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement du fichier');
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(async (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file || !user) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      validateFile(file);
      const result = await pdfExtractionService.uploadFile(file, user.id);
      setSuccess(`Fichier traité avec succès ! ${result.extractionResult?.tripsCount || 0} trajets extraits.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du traitement du fichier');
    } finally {
      setIsUploading(false);
    }
  }, [user]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload de facture</CardTitle>
        <CardDescription>
          Glissez-déposez votre facture Communauto PDF ou cliquez pour sélectionner
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isUploading || !user}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="space-y-4">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <Button variant="outline" disabled={isUploading || !user}>
                  {isUploading ? 'Traitement...' : 'Sélectionner un fichier PDF'}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Formats acceptés: PDF (max 10MB)
              </p>
            </div>
          </label>
        </div>
        
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mt-4 text-sm text-green-600 bg-green-50 p-3 rounded">
            {success}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
