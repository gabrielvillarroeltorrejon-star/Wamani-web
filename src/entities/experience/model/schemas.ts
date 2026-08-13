import { z } from 'zod';

export const DestinationSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  macroZone: z.string(),
  region: z.string(),
  description: z.string(),
  coverImage: z.object({
    url: z.string(),
    alt: z.string(),
    width: z.number().optional(),
    height: z.number().optional()
  })
});

export const ReviewSchema = z.object({
  id: z.string(),
  author: z.string(),
  rating: z.number().min(1).max(5),
  text: z.string(),
  date: z.string()
});

export const ExperienceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  status: z.enum(['active', 'draft', 'archived']),
  title: z.string(),
  subtitle: z.string(),
  summary: z.string(),
  description: z.string(),
  destinationId: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  duration: z.object({
    value: z.number(),
    unit: z.enum(['hours', 'days'])
  }),
  difficulty: z.enum(['easy', 'moderate', 'hard', 'expert']),
  languages: z.array(z.string()),
  pricing: z.object({
    basePrice: z.number(),
    currency: z.string().default('USD'),
    privateTourPrice: z.number().optional(),
    discounts: z.array(z.object({
      minPax: z.number(),
      percentage: z.number()
    })).optional()
  }),
  capacity: z.object({
    min: z.number(),
    max: z.number()
  }),
  gallery: z.array(z.object({
    url: z.string(),
    alt: z.string(),
    width: z.number().optional(),
    height: z.number().optional()
  })),
  coverImage: z.object({
    url: z.string(),
    alt: z.string(),
    width: z.number().optional(),
    height: z.number().optional()
  }),
  itinerary: z.array(z.object({
    dayOrTime: z.string(),
    title: z.string(),
    description: z.string()
  })),
  included: z.array(z.string()),
  notIncluded: z.array(z.string()),
  meetingPoint: z.string(),
  cancellationPolicy: z.string(),
  reviews: z.array(ReviewSchema).optional(),
  seo: z.object({
    metaTitle: z.string(),
    metaDescription: z.string()
  }).optional(),
  schedule: z.string().optional(),
  restrictions: z.array(z.string()).optional()
});

export type Destination = z.infer<typeof DestinationSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
