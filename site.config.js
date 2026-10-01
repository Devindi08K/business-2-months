/**
 * Single-file business rebranding.
 * Edit this file for each new client — almost no other code changes needed.
 * Admin panel / MongoDB overrides take precedence over these defaults at runtime.
 */
const siteConfig = {
  businessName: "Harbor & Hearth",
  tagline: "Fresh food, warm welcome",
  logo: "/logo.svg",
  favicon: "/favicon.ico",

  colors: {
    primary: "#1B4D3E",
    primaryDark: "#0F2F26",
    secondary: "#C4A574",
    accent: "#E8F0EC",
    background: "#FAFAF8",
    foreground: "#1A1A1A",
    muted: "#6B7280",
  },

  fonts: {
    heading: "Fraunces",
    body: "DM Sans",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap",
  },

  contact: {
    phone: "+94 11 234 5678",
    phoneRaw: "94112345678",
    email: "hello@harborhearth.example",
    whatsapp: "94771234567",
    address: "42 Galle Road, Colombo 03, Sri Lanka",
    mapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.798!2d79.850!3d6.914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTQnNTAuNCJOIDc5wrA1MScwMC4wIkU!5e0!3m2!1sen!2slk!4v1",
    mapLink: "https://maps.google.com/?q=Colombo+03",
  },

  social: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    twitter: "",
    youtube: "",
    linkedin: "",
    tiktok: "",
  },

  hours: [
    { day: "Monday", open: "09:00", close: "21:00", closed: false },
    { day: "Tuesday", open: "09:00", close: "21:00", closed: false },
    { day: "Wednesday", open: "09:00", close: "21:00", closed: false },
    { day: "Thursday", open: "09:00", close: "21:00", closed: false },
    { day: "Friday", open: "09:00", close: "22:00", closed: false },
    { day: "Saturday", open: "10:00", close: "22:00", closed: false },
    { day: "Sunday", open: "10:00", close: "20:00", closed: false },
  ],

  currency: {
    code: "LKR",
    symbol: "Rs.",
    locale: "en-LK",
  },

  features: {
    blog: true,
    bookings: true,
    gallery: true,
    testimonials: true,
    items: true,
    whatsappButton: true,
    clickToCall: true,
    multiLanguage: true,
  },

  itemLabels: {
    singular: "Dish",
    plural: "Menu",
    category: "Course",
  },

  seo: {
    titleTemplate: "%s | Harbor & Hearth",
    defaultTitle: "Harbor & Hearth — Fresh food, warm welcome",
    description:
      "Harbor & Hearth serves fresh seasonal dishes in the heart of Colombo. Book a table or order your favourites.",
    keywords: ["restaurant", "colombo", "dining", "fresh food"],
    ogImage: "/og-default.jpg",
    twitterHandle: "",
    locale: "en_LK",
  },

  locales: {
    default: "en",
    available: ["en", "si"],
  },

  hero: {
    headline: "Food that feels like home",
    subheadline:
      "Seasonal plates, calm atmosphere, and a table ready when you are.",
    ctaPrimary: { label: "View Menu", href: "/items" },
    ctaSecondary: { label: "Book a Table", href: "/booking" },
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
  },

  about: {
    title: "Our story",
    body: "Harbor & Hearth began as a small kitchen with one rule: cook what we would serve our own family. Today we still source from local growers, bake our bread daily, and keep the lights warm for late dinners and quiet lunches alike.",
  },
};

module.exports = siteConfig;
