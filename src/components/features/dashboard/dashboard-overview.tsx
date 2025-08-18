'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { FileUpload } from '@/components/features/pdf-extraction/file-upload';

export function DashboardOverview() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
        <div className="h-32 bg-gray-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              Veuillez vous connecter pour accéder au tableau de bord
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Bienvenue, {user.email}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aperçu du compte</CardTitle>
            <CardDescription>
              Informations sur votre compte Communauto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Statut:</span>
                <span className="text-green-600">Actif</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Factures:</span>
                <span>0 importée</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
            <CardDescription>
              Accès rapide aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              Voir mes trajets
            </Button>
            <Button className="w-full" variant="outline">
              Analyser mes coûts
            </Button>
            <Button className="w-full" variant="outline">
              Gérer mon profil
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Importer une facture</h2>
        <FileUpload />
      </div>
    </div>
  );
}
