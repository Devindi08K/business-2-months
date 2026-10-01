import { getSiteSettings } from "@/lib/settings";
import connectDB from "@/lib/db";
import BlogPost from "@/models/BlogPost";

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/items",
    "/gallery",
    "/testimonials",
    "/blog",
    "/booking",
  ];

  try {
    const settings = await getSiteSettings();
    const enabled = staticRoutes.filter((path) => {
      if (path === "/items") return settings.features?.items !== false;
      if (path === "/gallery") return settings.features?.gallery !== false;
      if (path === "/testimonials")
        return settings.features?.testimonials !== false;
      if (path === "/blog") return settings.features?.blog;
      if (path === "/booking") return settings.features?.bookings;
      return true;
    });

    const entries = enabled.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: path === "" ? 1 : 0.7,
    }));

    if (settings.features?.blog) {
      await connectDB();
      const posts = await BlogPost.find({ published: true })
        .select("slug updatedAt")
        .lean();
      for (const post of posts) {
        entries.push({
          url: `${base}/blog/${post.slug}`,
          lastModified: post.updatedAt || new Date(),
          changeFrequency: "monthly",
          priority: 0.5,
        });
      }
    }

    return entries;
  } catch {
    return staticRoutes.slice(0, 3).map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    }));
  }
}
