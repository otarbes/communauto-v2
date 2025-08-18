import { z } from 'zod';

/**
 * Validations pour l'extraction PDF
 */

// Schema pour les fichiers uploadés
export const fileUploadSchema = z.object({
  name: z.string().min(1, 'Nom de fichier requis'),
  type: z.string().refine(
    (type) => type === 'application/pdf',
    'Seuls les fichiers PDF sont autorisés'
  ),
  size: z.number().max(
    10 * 1024 * 1024, // 10MB
    'Le fichier ne peut pas dépasser 10MB'
  ),
});

// Schema pour les données de facture
export const invoiceDataSchema = z.object({
  accountNumber: z.string().min(1, 'Numéro de compte requis'),
  billingPeriod: z.object({
    start: z.string().min(1, 'Date de début requise'),
    end: z.string().min(1, 'Date de fin requise'),
  }),
  trips: z.array(z.object({
    id: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    startLocation: z.string(),
    endLocation: z.string(),
    distance: z.number().min(0),
    duration: z.number().min(0),
    vehicleType: z.string(),
    cost: z.number().min(0),
  })),
  transactions: z.array(z.object({
    id: z.string(),
    date: z.string(),
    type: z.string(),
    description: z.string(),
    amount: z.number(),
  })),
  summary: z.object({
    totalAmount: z.number(),
    currency: z.string().default('CAD'),
  }),
});

/**
 * Valide un fichier avant upload
 */
export function validateFile(file: File) {
  return fileUploadSchema.parse({
    name: file.name,
    type: file.type,
    size: file.size,
  });
}

/**
 * Valide les données extraites d'une facture
 */
export function validateInvoiceData(data: unknown) {
  return invoiceDataSchema.parse(data);
}
