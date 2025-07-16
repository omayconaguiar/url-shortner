import { z } from 'zod';

// Custom URL validation function
const isValidUrl = (urlString: string) => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const urlSchema = z.object({
  originalUrl: z
    .string()
    .min(1, 'URL is required')
    .refine(isValidUrl, 'Please enter a valid URL'),
  customSlug: z
    .string()
    .optional()
    .transform((val) => val?.trim() || undefined)
    .refine(
      (val) => !val || val === '' || /^[a-zA-Z0-9_-]+$/.test(val),
      'Slug can only contain letters, numbers, hyphens, and underscores'
    )
    .refine(
      (val) => !val || val === '' || (val.length >= 3 && val.length <= 50),
      'Slug must be between 3 and 50 characters'
    ),
});

export type UrlFormData = z.infer<typeof urlSchema>;