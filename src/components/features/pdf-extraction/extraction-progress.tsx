'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { UploadProgress } from '@/lib/pdf-extraction/service';

interface ExtractionProgressProps {
  progress: UploadProgress;
}

export function ExtractionProgress({ progress }: ExtractionProgressProps) {
  const getPhaseLabel = (phase: UploadProgress['phase']) => {
    switch (phase) {
      case 'uploading':
        return 'Upload du fichier';
      case 'processing':
        return 'Extraction des données';
      case 'saving':
        return 'Sauvegarde';
      case 'completed':
        return 'Terminé';
      case 'error':
        return 'Erreur';
      default:
        return 'Traitement';
    }
  };

  const getPhaseIcon = (phase: UploadProgress['phase']) => {
    switch (phase) {
      case 'uploading':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case 'processing':
        return (
          <svg className="h-5 w-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'saving':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Phase actuelle avec icône */}
          <div className="flex items-center space-x-3">
            {getPhaseIcon(progress.phase)}
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">
                  {getPhaseLabel(progress.phase)}
                </h3>
                <span className="text-sm font-medium text-gray-500">
                  {progress.progress}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {progress.message}
              </p>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <Progress 
              value={progress.progress} 
              className="w-full h-2"
            />
            
            {/* Étapes de progression */}
            <div className="flex justify-between text-xs text-gray-500">
              <span className={progress.phase === 'uploading' ? 'font-medium text-blue-600' : ''}>
                Upload
              </span>
              <span className={progress.phase === 'processing' ? 'font-medium text-blue-600' : ''}>
                Extraction
              </span>
              <span className={progress.phase === 'saving' ? 'font-medium text-blue-600' : ''}>
                Sauvegarde
              </span>
              <span className={progress.phase === 'completed' ? 'font-medium text-green-600' : ''}>
                Terminé
              </span>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {progress.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <svg className="h-4 w-4 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-red-700">
                  <strong>Erreur:</strong> {progress.error}
                </div>
              </div>
            </div>
          )}

          {/* Message de succès détaillé */}
          {progress.phase === 'completed' && !progress.error && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <svg className="h-4 w-4 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-green-700">
                  <strong>Succès:</strong> Votre facture a été traitée avec succès.
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}