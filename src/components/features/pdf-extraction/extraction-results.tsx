'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CommunautoInvoiceData } from '@/types/pdf';

interface ExtractionResultsProps {
  data: CommunautoInvoiceData;
  fileName: string;
}

export function ExtractionResults({ data, fileName }: ExtractionResultsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Résultats de l&apos;extraction
            <Badge variant="secondary">{fileName}</Badge>
          </CardTitle>
          <CardDescription>
            Données extraites de votre facture Communauto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.account_number}
              </div>
              <div className="text-sm text-muted-foreground">
                N° de compte
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.trips.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Trajets
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.transactions.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Transactions
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {parseFloat(data.total_amount.replace(',', '.')).toFixed(2)} $
              </div>
              <div className="text-sm text-muted-foreground">
                Montant total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Période de facturation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">Période de facturation</div>
              <div className="text-muted-foreground">
                {data.billing_period}
              </div>
            </div>
            <div className="text-muted-foreground">
              <div className="font-semibold">N° facture</div>
              <div className="text-muted-foreground">
                {data.invoice_number}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {data.trips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Aperçu des trajets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.trips.slice(0, 3).map((trip, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">
                      Véhicule {trip.vehicle_number} - Usager {trip.user_number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trip.start_datetime} - {trip.km}km - {trip.hours}h
                    </div>
                  </div>
                  <div className="font-semibold">
                    {parseFloat(trip.total_due.replace(',', '.')).toFixed(2)} $
                  </div>
                </div>
              ))}
              {data.trips.length > 3 && (
                <div className="text-center text-sm text-muted-foreground">
                  ... et {data.trips.length - 3} autres trajets
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
