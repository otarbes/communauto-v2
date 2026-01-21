'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import LayoutSidebar from '@/components/layout-sidebar';
import { FileUpload } from '@/components/features/pdf-extraction/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { data: currentUser, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <LayoutSidebar>
        <div className="container py-8">
          <div className="text-center">Chargement...</div>
        </div>
      </LayoutSidebar>
    );
  }

  if (!currentUser) {
    return (
      <LayoutSidebar>
        <div className="container py-8">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Connexion requise</CardTitle>
              <CardDescription>
                Vous devez vous connecter pour accéder au tableau de bord.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </LayoutSidebar>
    );
  }

  return (
    <LayoutSidebar>
      <div className="container py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Gérez vos factures Communauto et visualisez vos données d&apos;utilisation.
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Extraction de données PDF</CardTitle>
                <CardDescription>
                  Uploadez votre facture Communauto pour extraire automatiquement 
                  vos trajets et transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutSidebar>
  );
}