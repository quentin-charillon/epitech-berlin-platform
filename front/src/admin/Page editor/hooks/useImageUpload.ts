import { useRef } from "react";
import { compressImage } from "../utils/imageUtils";

export function useImageUpload({
  pendingInsertPointRef,
  backgroundType,
  actions,
  setters,
  setQuickMenu,
}: {
  pendingInsertPointRef: React.MutableRefObject<{ x: number; y: number } | null>;
  backgroundType: string;
  actions: any;
  setters: any;
  setQuickMenu: (v: any) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageFileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1400, 0.72);
      const point = pendingInsertPointRef.current || { x: 100, y: 100 };
      actions.addImage(String(compressed), point.x, point.y);
    } catch (error) {
      console.error(error);
      alert("Unable to compress this image.");
    } finally {
      e.target.value = "";
      setQuickMenu(null);
    }
  };

  const onPickBgImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 1920, 0.8);
      setters.setBackgroundImage(String(compressed));
      if (backgroundType !== "image") setters.setBackgroundType("image");
    } catch (error) {
      console.error(error);
      alert("Unable to compress this image.");
    } finally {
      e.target.value = "";
    }
  };

  const onPickGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const compressed = await Promise.all(files.map((f) => compressImage(f, 1400, 0.72)));
      const images = compressed.map((src) => ({
        id: Math.random().toString(36).slice(2),
        src: String(src),
      }));
      const point = pendingInsertPointRef.current || { x: 100, y: 100 };
      actions.addGalleryImages(images, point.x, point.y);
    } catch (error) {
      console.error(error);
      alert("Unable to compress images.");
    } finally {
      e.target.value = "";
      setQuickMenu(null);
    }
  };

  const videoInputRef = useRef<HTMLInputElement>(null);

  const onPickVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      alert("Video too large (max 100 MB). Choose a smaller file.");
      e.target.value = "";
      return;
    }
    try {
      const src = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const point = pendingInsertPointRef.current || { x: 100, y: 100 };
      actions.addVideo(src, point.x, point.y);
    } catch (error) {
      console.error(error);
      alert("Unable to read this video.");
    } finally {
      e.target.value = "";
      setQuickMenu(null);
    }
  };

  return {
    fileInputRef,
    bgImageFileInputRef,
    galleryInputRef,
    videoInputRef,
    onPickImage,
    onPickBgImage,
    onPickGallery,
    onPickVideo,
  };
}
