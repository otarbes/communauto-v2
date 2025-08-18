import { z } from 'zod';

// Schemas Zod partagés

export const emailSchema = z.string().email({
  message: 'Adresse email invalide',
});

export const passwordSchema = z.string().min(8, {
  message: 'Le mot de passe doit contenir au moins 8 caractères',
});

// Schema pour les IDs UUID
export const uuidSchema = z.string().uuid({
  message: 'ID invalide',
});
