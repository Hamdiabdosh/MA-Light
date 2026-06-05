import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { ACCEPTED_IMAGE_TYPES, uploadToCloudinary } from "@/lib/cloudinary";
import { Label } from "@/components/ui/label";

type ImageUploadZoneProps = {
  label?: string;
  images: string[];
  onImagesChange: (urls: string[]) => void;
  folder: string;
  multiple?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
};

export function ImageUploadZone({
  label = "Images",
  images,
  onImagesChange,
  folder,
  multiple = true,
  onUploadingChange,
}: ImageUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function setUploadState(next: boolean) {
    setUploading(next);
    onUploadingChange?.(next);
  }

  async function uploadFile(file: File) {
    setUploadState(true);
    try {
      const url = await uploadToCloudinary(file, { folder });
      onImagesChange(multiple ? [...images, url] : [url]);
      toast.success("Image uploaded.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploadState(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    void uploadFile(files[0]);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  function removeImage(url: string) {
    onImagesChange(images.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url) => (
            <div
              key={url}
              className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-3 px-6 py-10 transition-colors hover:border-gold"
      >
        {uploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        ) : (
          <Upload className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          Drag & drop or click to upload (JPEG, PNG, WebP — max 5MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="hidden"
          disabled={uploading}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
