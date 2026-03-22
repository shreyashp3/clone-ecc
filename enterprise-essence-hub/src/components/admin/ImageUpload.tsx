import { useState, useRef } from "react";
import { admin } from "@/integrations/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Check } from "lucide-react";

interface ImageUploadProps {
  value: string | string[];
  onChange: (url: string | string[]) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  multiple?: boolean;
  maxSize?: number;
}

const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

const getFileTypeError = (file: File): string | null => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  const validTypes = [...validImageTypes, ...validVideoTypes];
  
  if (!validTypes.includes(file.type)) {
    return `Invalid file type: ${file.type}. Allowed: JPEG, PNG, GIF, WebP, SVG, MP4, WebM, OGG`;
  }
  return null;
};

export default function ImageUpload({ 
  value, 
  onChange, 
  bucket = "media", 
  folder = "uploads", 
  label,
  multiple = false,
  maxSize = 10
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadedUrls = multiple ? (Array.isArray(value) ? value : []) : (typeof value === 'string' ? [value] : []);

  const handleUploadFile = async (file: File) => {
    // Validate file type
    const typeError = getFileTypeError(file);
    if (typeError) {
      toast.error(typeError);
      return;
    }

    // Validate file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File must be under ${maxSize}MB (file is ${(file.size / 1024 / 1024).toFixed(1)}MB)`);
      return;
    }

    setUploading(true);
    try {
      const newUrl = await admin.uploads.uploadFile(file);

      if (multiple) {
        const updatedUrls = Array.isArray(value) ? [...value, newUrl] : [newUrl];
        onChange(updatedUrls);
      } else {
        onChange(newUrl);
      }

      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (multiple) {
      files.forEach(file => handleUploadFile(file));
    } else {
      handleUploadFile(files[0]);
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    const imageOrVideoFiles = files.filter(f => 
      f.type.startsWith('image/') || f.type.startsWith('video/')
    );

    if (imageOrVideoFiles.length === 0) {
      toast.error("Please drop only image or video files");
      return;
    }

    if (multiple) {
      imageOrVideoFiles.forEach(file => handleUploadFile(file));
    } else {
      handleUploadFile(imageOrVideoFiles[0]);
    }
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    if (!isValidUrl(urlInput)) {
      toast.error("Invalid URL format. Must start with http:// or https://");
      return;
    }

    if (multiple) {
      const updatedUrls = Array.isArray(value) ? [...value, urlInput] : [urlInput];
      onChange(updatedUrls);
    } else {
      onChange(urlInput);
    }

    setUrlInput("");
    toast.success("URL added");
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    if (multiple) {
      const updated = uploadedUrls.filter(u => u !== urlToRemove);
      onChange(updated);
    } else {
      onChange("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Drag-drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragActive 
            ? "border-primary bg-primary/5" 
            : "border-border bg-background hover:border-primary/50"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Drag & drop {multiple ? "images/videos" : "an image/video"} here
              </p>
              <p className="text-xs text-muted-foreground">
                or click to browse (max {maxSize}MB)
              </p>
            </>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple={multiple}
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </div>

      {/* URL input */}
      <div className="flex gap-2">
        <Input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Or paste URL (https://...)"
          className="flex-1"
          onKeyPress={(e) => e.key === 'Enter' && handleUrlAdd()}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleUrlAdd}
          disabled={uploading || !urlInput.trim()}
        >
          Add URL
        </Button>
      </div>

      {/* Uploaded files gallery */}
      {uploadedUrls.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {uploadedUrls.length} file{uploadedUrls.length !== 1 ? 's' : ''} uploaded
          </p>
          <div className={`grid gap-2 ${multiple ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {uploadedUrls.map((url, idx) => (
              <div key={idx} className="relative group">
                <div className="w-full aspect-square rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                  {url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <video src={url} className="max-w-full max-h-full" />
                    </div>
                  ) : (
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" onError={() => {
                      toast.error(`Failed to load image ${idx + 1}`);
                    }} />
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveUrl(url)}
                >
                  <X className="w-3 h-3" />
                </Button>
                <div className="absolute bottom-1 left-1 bg-green-500/80 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL validation error hints */}
      <div className="text-xs text-muted-foreground">
        <p>✓ Supported formats: JPG, PNG, GIF, WebP, SVG, MP4, WebM</p>
        <p>✓ Max file size: {maxSize}MB</p>
      </div>
    </div>
  );
}
