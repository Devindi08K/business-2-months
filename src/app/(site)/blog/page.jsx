import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { getSiteSettings } from "@/lib/settings";
import { notFound } from "next/navigation";

export const metadata = { title: "News" };

export default async function BlogIndexPage() {
  const settings = await getSiteSettings();
  if (!settings.features?.blog) notFound();

  let posts = [];
  try {
    await connectDB();
    posts = await BlogPost.find({ published: true })
      .sort({ publishedAt: -1 })
      .lean();
  } catch (err) {
    console.warn("[blog] DB load error:", err?.message);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-32 md:px-6">
      <h1 className="font-heading text-4xl font-semibold md:text-5xl">News</h1>
      <div className="mt-10 space-y-10">
        {posts.map((post) => (
          <article key={String(post._id)} className="border-b border-[var(--color-foreground)]/10 pb-10">
            {post.coverImage ? (
              <div className="relative mb-4 aspect-[21/9] overflow-hidden rounded-lg">
                <Image
                  src={post.coverImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            ) : null}
            <h2 className="font-heading text-2xl font-semibold">
              <Link href={`/blog/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </h2>
            {post.excerpt ? (
              <p className="mt-2 text-[var(--color-muted)]">{post.excerpt}</p>
            ) : null}
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString()
                : ""}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
