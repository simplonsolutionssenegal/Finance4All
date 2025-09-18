import * as z from 'zod';

import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from './constants';

export const formSchema = z.object({
  nom: z.string().min(2, { message: 'Le nom doit contenir au moins 2 caractères.' }),
  type: z.string({ required_error: "Veuillez sélectionner un type d'institution." }),
  description: z
    .string()
    .min(10, { message: 'La description doit contenir au moins 10 caractères.' }),
  siteWeb: z.string().url({ message: 'Veuillez saisir une URL valide.' }),
  logo: z
    .custom<FileList | null | undefined>(
      v => v === undefined || v === null || v instanceof FileList,
      { message: 'Format de fichier invalide.' }
    )
    .optional()
    .refine(files => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, {
      message: 'La taille maximale du fichier est de 5MB.',
    })
    .refine(files => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type), {
      message: 'Seuls les formats .jpg, .jpeg et .png sont acceptés.',
    }),
  contactNom: z.preprocess(
    v => (v === '' ? undefined : v),
    z.string().min(2, { message: 'Le nom du contact doit contenir au moins 2 caractères.' }).optional()
  ),
  contactEmail: z.preprocess(
    v => (v === '' ? undefined : v),
    z.string().email({ message: 'Veuillez saisir une adresse email valide.' }).optional()
  ),
  contactTelephone: z.preprocess(
    v => (v === '' ? undefined : v),
    z.string().min(8, { message: 'Veuillez saisir un numéro de téléphone valide.' }).optional()
  ),
  regionsDesservies: z.array(z.string()).min(1, { message: 'Veuillez sélectionner au moins une région.' }),
});

export type InstitutionFormValues = z.infer<typeof formSchema>;
