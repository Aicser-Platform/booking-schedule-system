import type React from "react";
import { Camera, Image as ImageIcon, X } from "lucide-react";

type ServiceImageSectionProps = {
  labelClass: string;
  pillButtonClass: string;
  primaryPillClass: string;
  ghostDangerClass: string;
  imageMode: "upload" | "url";
  setImageMode: (mode: "upload" | "url") => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFilesSelect: (files?: FileList | null) => void;
  primaryImage: string;
  isUploading: boolean;
  imageUrlInput: string;
  setImageUrlInput: (value: string) => void;
  addImageFromInput: () => void;
  uploadError: string | null;
  imageUrls: string[];
  removeImageAt: (index: number) => void;
  updateImages: (nextImages: string[]) => void;
};

export function ServiceImageSection({
  labelClass,
  pillButtonClass,
  primaryPillClass,
  ghostDangerClass,
  imageMode,
  setImageMode,
  fileInputRef,
  handleFilesSelect,
  primaryImage,
  isUploading,
  imageUrlInput,
  setImageUrlInput,
  addImageFromInput,
  uploadError,
  imageUrls,
  removeImageAt,
  updateImages,
}: ServiceImageSectionProps) {
  return (
    <div className="space-y-4">
      <label className={labelClass}>Service Visual Identity</label>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setImageMode("upload")}
          className={`rounded-2xl border-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
            imageMode === "upload" ? primaryPillClass : pillButtonClass
          }`}
        >
          Upload Asset
        </button>
        <button
          type="button"
          onClick={() => setImageMode("url")}
          className={`rounded-2xl border-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
            imageMode === "url" ? primaryPillClass : pillButtonClass
          }`}
        >
          Image URL
        </button>
      </div>

      {imageMode === "upload" && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void handleFilesSelect(event.dataTransfer.files);
          }}
          className="group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-border/70 bg-muted/40 transition-all hover:border-primary/60 hover:bg-muted/60"
          role="button"
          tabIndex={0}
        >
          {primaryImage ? (
            <>
              <img
                src={primaryImage}
                alt="Service preview"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={32} />
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 rounded-2xl bg-card p-4 text-muted-foreground shadow-sm transition-colors group-hover:text-primary">
                <ImageIcon size={32} />
              </div>
              <p className="text-xs font-bold text-muted-foreground transition-colors group-hover:text-primary">
                Upload Presentation Asset
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                JPG, PNG, WEBP recommended
              </p>
            </>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-xs font-semibold text-muted-foreground">
              Uploading...
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void handleFilesSelect(event.target.files)}
      />

      {imageMode === "url" && (
        <div className="space-y-2">
          <label htmlFor="service-image-url" className={labelClass}>
            Image URL
          </label>
          <div className="flex flex-wrap gap-3">
            <input
              id="service-image-url"
              type="url"
              value={imageUrlInput}
              onChange={(event) => setImageUrlInput(event.target.value)}
              placeholder="https://..."
              className="min-w-[240px] flex-1 rounded-2xl border-2 border-transparent bg-muted px-5 py-4 font-bold text-foreground outline-none transition-all focus:border-primary focus:bg-background"
            />
            <button
              type="button"
              onClick={addImageFromInput}
              className="rounded-2xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
            >
              Add Image
            </button>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-sm font-semibold text-destructive" role="alert">
          {uploadError}
        </p>
      )}

      {imageUrls.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setImageMode("upload")}
            className={pillButtonClass}
          >
            Replace Image
          </button>
          <button
            type="button"
            onClick={() => {
              updateImages([]);
              setImageMode("upload");
            }}
            className={ghostDangerClass}
          >
            Remove Image
          </button>
        </div>
      )}

      {imageUrls.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {imageUrls.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative overflow-hidden rounded-2xl border border-border"
            >
              <img
                src={url}
                alt={`Service image ${index + 1}`}
                className="h-40 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImageAt(index)}
                className="absolute right-3 top-3 rounded-full bg-card/90 p-2 text-muted-foreground shadow transition hover:text-destructive"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
