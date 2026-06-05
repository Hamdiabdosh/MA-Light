export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

function readCloudName() {
  return String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "").trim();
}

function readUploadPreset() {
  return String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "").trim();
}

function isAcceptedImage(file: File) {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return true;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(ext as (typeof ACCEPTED_EXTENSIONS)[number]);
}

export function validateImageFile(file: File): string | null {
  if (!isAcceptedImage(file)) {
    return "Only JPEG, PNG, and WebP images are allowed.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

export async function uploadToCloudinary(
  file: File,
  options?: { folder?: string },
): Promise<string> {
  const cloudName = readCloudName();
  const uploadPreset = readUploadPreset();

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env, then restart the dev server.",
    );
  }

  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  if (options?.folder) formData.append("folder", options.folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  let data: CloudinaryUploadResponse;
  try {
    data = (await response.json()) as CloudinaryUploadResponse;
  } catch {
    throw new Error(`Cloudinary upload failed (HTTP ${response.status}).`);
  }

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message ?? `Cloudinary upload failed (HTTP ${response.status}).`);
  }

  return data.secure_url;
}
