import Image from "next/image";
import connectDB from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { getSiteSettings } from "@/lib/settings";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const post = await BlogPost.findOne({ slug: params.slug, published: true }).lean();
    if (!post) return { title: "Post" };
    return {
      title: post.title,
      description: post.excerpt,
    };
  } catch {
    return { title: "Post" };
  }
}

export default async function BlogPostPage({ params }) {
  const settings = await getSiteSettings();
  if (!settings.features?.blog) notFound();

  let post = null;
  try {
    await connectDB();
    post = await BlogPost.findOne({
      slug: params.slug,
      published: true,
    }).lean();
  } catch (err) {
    console.warn("[blog/slug] DB load error:", err?.message);
  }
  if (!post) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-32 md:px-6">
      <p className="text-sm text-[var(--color-muted)]">
        {post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString()
          : ""}
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold md:text-5xl">
        {post.title}
      </h1>
      {post.coverImage ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={post.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      ) : null}
      <div
        className="prose-site mt-8 space-y-4 leading-relaxed text-[var(--color-foreground)]/90 [&_a]:underline [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-semibold [&_img]:rounded-lg"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </main>
  );
}
