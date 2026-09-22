import { useRef, useState } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import Button from '../ui/Button';
import type { ItemImage as BaseItemImage } from '../../types';

export type ItemImage = BaseItemImage & { _file?: File };

interface Props {
  images: ItemImage[];
  onChange: (images: ItemImage[]) => void;
  max?: number;
}

export default function ImageUpload({ images, onChange, max = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = max - images.length;
    const selected = Array.from(files).slice(0, remaining);

    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Store files temporarily as blob URLs for upload during analyze/submit
    const newImages = selected.map((file) => ({
      url: URL.createObjectURL(file),
      publicId: file.name,
      _file: file,
    })) as ItemImage[];

    onChange([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileUpload = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-slate-200">
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {images.length < max && (
          <>
            <button
              type="button"
              onClick={handleFileUpload}
              className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              <Upload className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="mt-1 text-xs sm:text-sm">Upload</span>
            </button>
            <button
              type="button"
              onClick={handleCameraCapture}
              className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400 hover:border-brand-400 hover:text-brand-600 transition-colors"
            >
              <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="mt-1 text-xs sm:text-sm">Camera</span>
            </button>
          </>
        )}
      </div>
      
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      
      <p className="mt-3 text-xs sm:text-sm text-slate-500">JPEG, PNG, WebP up to 5MB each. Max {max} images.</p>
    </div>
  );
}

export function getFileFromImage(img: ItemImage & { _file?: File }) {
  return img._file;
}
