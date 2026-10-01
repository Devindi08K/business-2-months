import mongoose from "mongoose";

const SiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    businessName: String,
    tagline: String,
    logo: String,
    phone: String,
    phoneRaw: String,
    email: String,
    whatsapp: String,
    address: String,
    mapEmbedUrl: String,
    mapLink: String,
    social: {
      facebook: String,
      instagram: String,
      twitter: String,
      youtube: String,
      linkedin: String,
      tiktok: String,
    },
    hours: [
      {
        day: String,
        open: String,
        close: String,
        closed: Boolean,
      },
    ],
    colors: {
      primary: String,
      primaryDark: String,
      secondary: String,
      accent: String,
      background: String,
      foreground: String,
      muted: String,
    },
    hero: {
      headline: String,
      subheadline: String,
      ctaPrimary: { label: String, href: String },
      ctaSecondary: { label: String, href: String },
      image: String,
    },
    about: {
      title: String,
      body: String,
    },
    seo: {
      titleTemplate: String,
      defaultTitle: String,
      description: String,
      keywords: [String],
      ogImage: String,
    },
    features: {
      blog: Boolean,
      bookings: Boolean,
      gallery: Boolean,
      testimonials: Boolean,
      items: Boolean,
      whatsappButton: Boolean,
      clickToCall: Boolean,
      multiLanguage: Boolean,
    },
    currency: {
      code: String,
      symbol: String,
      locale: String,
    },
    itemLabels: {
      singular: String,
      plural: String,
      category: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.SiteSettings ||
  mongoose.model("SiteSettings", SiteSettingsSchema);
