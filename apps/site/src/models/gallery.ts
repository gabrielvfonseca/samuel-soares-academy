import { z } from "zod";

export const GalleryImageSchema = z.object({
  alt: z.string(),
  span: z.string(),
  src: z.string(),
});

export const GalleryImagesSchema = z.array(GalleryImageSchema);

export type GalleryImage = z.infer<typeof GalleryImageSchema>;
export type GalleryImages = z.infer<typeof GalleryImagesSchema>;

export const GallerySectionSchema = z.object({
  description: z.string(),
  items: GalleryImagesSchema,
  title: z.string(),
});

export type GallerySection = z.infer<typeof GallerySectionSchema>;
