import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(10, "Password must be at least 10 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");

export const loginSchema = z.object({
  email: z.string().email().max(255).toLowerCase().trim(),
  password: z.string().min(1).max(128),
  csrfToken: z.string().min(1).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.string().min(2).max(200).trim(),
  message: z.string().min(10).max(5000).trim(),
  honeypot: z.string().max(0).optional().or(z.literal("")),
  turnstileToken: z.string().optional(),
  csrfToken: z.string().optional(),
});

export const bookingSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  phone: z.string().min(7).max(30).trim(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  partySize: z.coerce.number().int().min(1).max(50),
  service: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  honeypot: z.string().max(0).optional().or(z.literal("")),
  turnstileToken: z.string().optional(),
  csrfToken: z.string().optional(),
});

export const itemSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(2000).optional().or(z.literal("")),
  category: z.string().min(1),
  price: z.coerce.number().min(0).optional().nullable(),
  image: z.string().url().optional().or(z.literal("")).or(z.null()),
  imagePublicId: z.string().max(300).optional().or(z.literal("")).or(z.null()),
  isAvailable: z.boolean().optional(),
  featured: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  order: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const gallerySchema = z.object({
  url: z.string().url(),
  publicId: z.string().max(300).optional().or(z.literal("")),
  caption: z.string().max(300).optional().or(z.literal("")),
  alt: z.string().max(200).optional().or(z.literal("")),
  order: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const testimonialSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  title: z.string().max(100).optional().or(z.literal("")),
  content: z.string().min(5).max(1000).trim(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  image: z.string().url().optional().or(z.literal("")).or(z.null()),
  order: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const blogSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  content: z.string().min(1).max(50000),
  coverImage: z.string().url().optional().or(z.literal("")).or(z.null()),
  published: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().or(z.null()),
});

export const pageContentSchema = z.object({
  key: z.string().min(1).max(50),
  locale: z.string().min(2).max(5).optional(),
  sections: z.record(z.any()),
});

export const userCreateSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(255).toLowerCase().trim(),
  password: passwordSchema,
  role: z.enum(["owner", "editor"]),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const messageReplySchema = z.object({
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
});

export const bookingStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled"]),
  note: z.string().max(500).optional(),
});

export const settingsSchema = z.object({
  businessName: z.string().max(200).optional(),
  tagline: z.string().max(300).optional(),
  logo: z.string().optional(),
  phone: z.string().max(50).optional(),
  phoneRaw: z.string().max(30).optional(),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().max(30).optional(),
  address: z.string().max(500).optional(),
  mapEmbedUrl: z.string().optional(),
  mapLink: z.string().optional(),
  social: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional(),
      linkedin: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),
  hours: z
    .array(
      z.object({
        day: z.string(),
        open: z.string(),
        close: z.string(),
        closed: z.boolean(),
      })
    )
    .optional(),
  colors: z
    .object({
      primary: z.string().optional(),
      primaryDark: z.string().optional(),
      secondary: z.string().optional(),
      accent: z.string().optional(),
      background: z.string().optional(),
      foreground: z.string().optional(),
      muted: z.string().optional(),
    })
    .optional(),
  hero: z
    .object({
      headline: z.string().optional(),
      subheadline: z.string().optional(),
      ctaPrimary: z
        .object({ label: z.string(), href: z.string() })
        .optional(),
      ctaSecondary: z
        .object({ label: z.string(), href: z.string() })
        .optional(),
      image: z.string().optional(),
    })
    .optional(),
  about: z
    .object({
      title: z.string().optional(),
      body: z.string().optional(),
    })
    .optional(),
  seo: z
    .object({
      titleTemplate: z.string().optional(),
      defaultTitle: z.string().optional(),
      description: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      ogImage: z.string().optional(),
    })
    .optional(),
  features: z
    .object({
      blog: z.boolean().optional(),
      bookings: z.boolean().optional(),
      gallery: z.boolean().optional(),
      testimonials: z.boolean().optional(),
      items: z.boolean().optional(),
      whatsappButton: z.boolean().optional(),
      clickToCall: z.boolean().optional(),
      multiLanguage: z.boolean().optional(),
    })
    .optional(),
  currency: z
    .object({
      code: z.string().optional(),
      symbol: z.string().optional(),
      locale: z.string().optional(),
    })
    .optional(),
  itemLabels: z
    .object({
      singular: z.string().optional(),
      plural: z.string().optional(),
      category: z.string().optional(),
    })
    .optional(),
});

export function parseOrError(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join("; ");
    return { success: false, error: message, issues: result.error.errors };
  }
  return { success: true, data: result.data };
}
