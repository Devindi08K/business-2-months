/**
 * Seed admin user + sample content.
 * Usage: npm run seed
 * Requires MONGODB_URI and ADMIN_* env vars (see .env.example).
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const siteConfig = require("../site.config");

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Owner";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: String,
    failedLoginAttempts: Number,
    lockUntil: Date,
    refreshTokenVersion: Number,
  },
  { timestamps: true }
);

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    order: Number,
    isActive: Boolean,
  },
  { timestamps: true }
);

const ItemSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    price: Number,
    image: String,
    isAvailable: Boolean,
    featured: Boolean,
    order: Number,
  },
  { timestamps: true }
);

const GalleryImageSchema = new mongoose.Schema(
  {
    url: String,
    caption: String,
    alt: String,
    order: Number,
    isActive: Boolean,
  },
  { timestamps: true }
);

const TestimonialSchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    content: String,
    rating: Number,
    order: Number,
    isActive: Boolean,
  },
  { timestamps: true }
);

const BlogPostSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    excerpt: String,
    content: String,
    coverImage: String,
    published: Boolean,
    publishedAt: Date,
  },
  { timestamps: true }
);

const SiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
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
    social: Object,
    hours: Array,
    colors: Object,
    hero: Object,
    about: Object,
    seo: Object,
    features: Object,
    currency: Object,
    itemLabels: Object,
  },
  { timestamps: true }
);

const PageContentSchema = new mongoose.Schema(
  {
    key: String,
    locale: String,
    sections: Object,
  },
  { timestamps: true }
);

async function main() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  console.log("Connected to MongoDB");

  const User = mongoose.models.User || mongoose.model("User", UserSchema);
  const Category =
    mongoose.models.Category || mongoose.model("Category", CategorySchema);
  const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);
  const GalleryImage =
    mongoose.models.GalleryImage ||
    mongoose.model("GalleryImage", GalleryImageSchema);
  const Testimonial =
    mongoose.models.Testimonial ||
    mongoose.model("Testimonial", TestimonialSchema);
  const BlogPost =
    mongoose.models.BlogPost || mongoose.model("BlogPost", BlogPostSchema);
  const SiteSettings =
    mongoose.models.SiteSettings ||
    mongoose.model("SiteSettings", SiteSettingsSchema);
  const PageContent =
    mongoose.models.PageContent ||
    mongoose.model("PageContent", PageContentSchema);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.findOneAndUpdate(
    { email: ADMIN_EMAIL.toLowerCase() },
    {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: "owner",
      failedLoginAttempts: 0,
      lockUntil: null,
    },
    { upsert: true, new: true }
  );
  console.log("Admin user ready:", ADMIN_EMAIL);

  await SiteSettings.findOneAndUpdate(
    { key: "main" },
    {
      key: "main",
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
      social: siteConfig.social,
      hours: siteConfig.hours,
      colors: siteConfig.colors,
      hero: {
        ...siteConfig.hero,
        image:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
      },
      about: siteConfig.about,
      seo: siteConfig.seo,
      features: siteConfig.features,
      currency: siteConfig.currency,
      itemLabels: siteConfig.itemLabels,
    },
    { upsert: true }
  );
  console.log("Site settings seeded");

  await PageContent.findOneAndUpdate(
    { key: "about", locale: "en" },
    {
      key: "about",
      locale: "en",
      sections: {
        title: siteConfig.about.title,
        body: `${siteConfig.about.body}\n\nWe keep a short menu, change with the seasons, and always have a quiet corner for conversation.`,
      },
    },
    { upsert: true }
  );

  const cats = [
    { name: "Starters", slug: "starters", order: 1 },
    { name: "Mains", slug: "mains", order: 2 },
    { name: "Desserts", slug: "desserts", order: 3 },
  ];

  const categoryDocs = [];
  for (const c of cats) {
    const doc = await Category.findOneAndUpdate(
      { slug: c.slug },
      { ...c, isActive: true },
      { upsert: true, new: true }
    );
    categoryDocs.push(doc);
  }

  const sampleItems = [
    {
      title: "Roasted pumpkin soup",
      description: "Coconut cream, toasted seeds, curry leaf oil.",
      category: categoryDocs[0]._id,
      price: 950,
      image:
        "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=800&q=80",
      featured: true,
      order: 1,
    },
    {
      title: "Herb grilled chicken",
      description: "Local free-range bird, lemon relish, warm flatbread.",
      category: categoryDocs[1]._id,
      price: 2200,
      image:
        "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800&q=80",
      featured: true,
      order: 1,
    },
    {
      title: "Catch of the day",
      description: "Market fish, coastal greens, butter sauce.",
      category: categoryDocs[1]._id,
      price: 2800,
      image:
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80",
      featured: true,
      order: 2,
    },
    {
      title: "Jaggery caramel pudding",
      description: "Sea salt, roasted cashew, cold cream.",
      category: categoryDocs[2]._id,
      price: 850,
      image:
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80",
      featured: false,
      order: 1,
    },
  ];

  for (const item of sampleItems) {
    await Item.findOneAndUpdate(
      { title: item.title },
      { ...item, isAvailable: true },
      { upsert: true }
    );
  }
  console.log("Sample items seeded");

  const gallery = [
    {
      url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80",
      caption: "Evening service",
      alt: "Restaurant dining room",
      order: 1,
    },
    {
      url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80",
      caption: "Plate of the week",
      alt: "Food plating",
      order: 2,
    },
    {
      url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80",
      caption: "Shared table",
      alt: "Dining table",
      order: 3,
    },
    {
      url: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=900&q=80",
      caption: "Kitchen pass",
      alt: "Kitchen",
      order: 4,
    },
  ];

  for (const g of gallery) {
    await GalleryImage.findOneAndUpdate(
      { url: g.url },
      { ...g, isActive: true },
      { upsert: true }
    );
  }
  console.log("Gallery seeded");

  const testimonials = [
    {
      name: "Amaya P.",
      title: "Regular guest",
      content:
        "Quiet enough for a long lunch, careful enough that every plate feels intentional.",
      rating: 5,
      order: 1,
    },
    {
      name: "Rohan S.",
      title: "Colombo",
      content:
        "We booked for a birthday — they remembered the cake and never rushed the table.",
      rating: 5,
      order: 2,
    },
    {
      name: "Nisha F.",
      title: "Food writer",
      content:
        "Seasonal cooking with a calm room. The pumpkin soup alone is worth the visit.",
      rating: 5,
      order: 3,
    },
  ];

  for (const t of testimonials) {
    await Testimonial.findOneAndUpdate(
      { name: t.name, content: t.content },
      { ...t, isActive: true },
      { upsert: true }
    );
  }
  console.log("Testimonials seeded");

  await BlogPost.findOneAndUpdate(
    { slug: "welcome-to-harbor-hearth" },
    {
      title: "Welcome to Harbor & Hearth",
      slug: "welcome-to-harbor-hearth",
      excerpt: "A short note on how we cook, source, and host.",
      content:
        "<p>We opened Harbor &amp; Hearth to serve food that feels like a good evening at home — seasonal, unfussy, and shared.</p><p>This week on the menu: roasted pumpkin soup, herb grilled chicken, and a jaggery caramel pudding we cannot stop making.</p>",
      coverImage:
        "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&q=80",
      published: true,
      publishedAt: new Date(),
    },
    { upsert: true }
  );
  console.log("Blog post seeded");

  console.log("\nSeed complete. You can now run: npm run dev");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
