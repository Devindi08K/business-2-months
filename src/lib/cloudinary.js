import { v2 as cloudinary } from "cloudinary";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export function getUploadSignature(folder = "business-site") {
  configureCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder,
    allowed_formats: "jpg,jpeg,png,webp,gif",
  };
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  );
  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  };
}

/**
 * Server-side upload via Cloudinary upload API (signed).
 */
export async function uploadImageBuffer(buffer, { filename, mimeType, folder }) {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw Object.assign(new Error("Invalid file type"), { status: 400 });
  }
  const ext = (filename || "").split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXT.has(ext)) {
    throw Object.assign(new Error("Invalid file extension"), { status: 400 });
  }
  if (buffer.length > MAX_BYTES) {
    throw Object.assign(new Error("File too large (max 5MB)"), { status: 400 });
  }

  configureCloudinary();
  const b64 = `data:${mimeType};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(b64, {
    folder: folder || process.env.CLOUDINARY_FOLDER || "business-site",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

export async function deleteImage(publicId) {
  if (!publicId) return;
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId);
}

export { ALLOWED_MIME, ALLOWED_EXT, MAX_BYTES };
