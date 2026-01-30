import { z } from "zod";

export const GalleryImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  span: z.string(),
});

export const GalleryImagesSchema = z.array(GalleryImageSchema);

export type GalleryImage = z.infer<typeof GalleryImageSchema>;
export type GalleryImages = z.infer<typeof GalleryImagesSchema>;

export const GallerySectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  items: GalleryImagesSchema,
});

export type GallerySection = z.infer<typeof GallerySectionSchema>;
