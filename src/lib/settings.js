import connectDB from "./db";
import SiteSettings from "@/models/SiteSettings";
import siteConfig from "../../site.config";

/**
 * Merge site.config.js defaults with MongoDB overrides.
 */
export async function getSiteSettings() {
  try {
    await connectDB();
    let doc = await SiteSettings.findOne({ key: "main" }).lean();
    if (!doc) {
      return buildFromConfig();
    }
    return mergeSettings(doc);
  } catch (err) {
    console.warn("[settings] Fallback to siteConfig defaults:", err?.message);
    return buildFromConfig();
  }
}

export function buildFromConfig() {
  return {
    businessName: siteConfig.businessName,
    tagline: siteConfig.tagline,
    logo: siteConfig.logo,
    phone: siteConfig.contact.phone,
    phoneRaw: siteConfig.contact.phoneRaw,
    email: siteConfig.contact.email,
    whatsapp: siteConfig.contact.whatsapp,
    address: siteConfig.contact.address,
    mapEmbedUrl: siteConfig.contact.mapEmbedUrl,
    mapLink: siteConfig.contact.mapLink,
    social: { ...siteConfig.social },
    hours: siteConfig.hours.map((h) => ({ ...h })),
    colors: { ...siteConfig.colors },
    fonts: { ...siteConfig.fonts },
    hero: { ...siteConfig.hero },
    about: { ...siteConfig.about },
    seo: { ...siteConfig.seo },
    features: { ...siteConfig.features },
    currency: { ...siteConfig.currency },
    itemLabels: { ...siteConfig.itemLabels },
    locales: { ...siteConfig.locales },
  };
}

function mergeSettings(doc) {
  const base = buildFromConfig();
  return {
    ...base,
    businessName: doc.businessName || base.businessName,
    tagline: doc.tagline ?? base.tagline,
    logo: doc.logo || base.logo,
    phone: doc.phone || base.phone,
    phoneRaw: doc.phoneRaw || base.phoneRaw,
    email: doc.email || base.email,
    whatsapp: doc.whatsapp || base.whatsapp,
    address: doc.address || base.address,
    mapEmbedUrl: doc.mapEmbedUrl || base.mapEmbedUrl,
    mapLink: doc.mapLink || base.mapLink,
    social: { ...base.social, ...(doc.social || {}) },
    hours: doc.hours?.length ? doc.hours : base.hours,
    colors: { ...base.colors, ...(doc.colors || {}) },
    hero: { ...base.hero, ...(doc.hero || {}) },
    about: { ...base.about, ...(doc.about || {}) },
    seo: { ...base.seo, ...(doc.seo || {}) },
    features: { ...base.features, ...(doc.features || {}) },
    currency: { ...base.currency, ...(doc.currency || {}) },
    itemLabels: { ...base.itemLabels, ...(doc.itemLabels || {}) },
  };
}

export function themeCssVars(colors) {
  const c = colors || siteConfig.colors;
  return {
    "--color-primary": c.primary,
    "--color-primary-dark": c.primaryDark,
    "--color-secondary": c.secondary,
    "--color-accent": c.accent,
    "--color-background": c.background,
    "--color-foreground": c.foreground,
    "--color-muted": c.muted,
  };
}

export function formatPrice(amount, currency) {
  if (amount == null || amount === "") return null;
  const cur = currency || siteConfig.currency;
  try {
    return new Intl.NumberFormat(cur.locale || "en", {
      style: "currency",
      currency: cur.code || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${cur.symbol || ""}${amount}`;
  }
}
