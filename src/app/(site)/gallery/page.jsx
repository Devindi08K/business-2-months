import Image from "next/image";
import connectDB from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  let images = [];
  try {
    await connectDB();
    images = await GalleryImage.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
  } catch (err) {
    console.warn("[gallery] DB load error:", err?.message);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-32 md:px-6">
      <h1 className="font-heading text-4xl font-semibold md:text-5xl">Gallery</h1>
      <p className="mt-3 text-[var(--color-muted)]">
        A look inside — plates, spaces, and quiet moments.
      </p>
      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((img) => (
          <figure key={String(img._id)} className="mb-4 break-inside-avoid">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg">
              <Image
                src={img.url}
                alt={img.alt || img.caption || "Gallery image"}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            </div>
            {img.caption ? (
              <figcaption className="mt-2 text-sm text-[var(--color-muted)]">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </main>
  );
}
