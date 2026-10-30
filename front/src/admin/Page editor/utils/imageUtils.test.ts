import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compressImage as compressEditorImage } from "./imageUtils";
import { compressImage as compressSiteImage } from "../../siteSettings/utils";

function createFile(name = "photo.png") {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "image/png" });
}

function mockCompressionDom({
  imageWidth = 4000,
  imageHeight = 2000,
  hasContext = true,
}: {
  imageWidth?: number;
  imageHeight?: number;
  hasContext?: boolean;
} = {}) {
  const drawImage = vi.fn();
  const toDataURL = vi.fn(() => "data:image/webp;base64,compressed");
  const originalCreateElement = document.createElement.bind(document);
  const createElementSpy = vi.spyOn(document, "createElement").mockImplementation((tagName) => {
    if (tagName === "canvas") {
      const canvas = originalCreateElement("canvas") as HTMLCanvasElement;
      Object.defineProperty(canvas, "getContext", {
        value: vi.fn(() => (hasContext ? { drawImage } : null)),
      });
      Object.defineProperty(canvas, "toDataURL", {
        value: toDataURL,
      });
      return canvas;
    }
    return (originalCreateElement as any)(tagName);
  });

  const originalFileReader = globalThis.FileReader;
  class MockFileReader {
    result = "data:image/png;base64,original";
    onload: null | (() => void) = null;
    onerror: null | (() => void) = null;

    readAsDataURL() {
      this.onload?.();
    }
  }
  globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

  const originalImage = globalThis.Image;
  class MockImage {
    width = imageWidth;
    height = imageHeight;
    onload: null | (() => void) = null;
    onerror: null | (() => void) = null;

    set src(_value: string) {
      this.onload?.();
    }
  }
  globalThis.Image = MockImage as unknown as typeof Image;

  return {
    drawImage,
    toDataURL,
    restore() {
      createElementSpy.mockRestore();
      globalThis.FileReader = originalFileReader;
      globalThis.Image = originalImage;
    },
  };
}

describe("compressImage utilities", () => {
  let restoreDom: null | (() => void) = null;

  beforeEach(() => {
    restoreDom = null;
  });

  afterEach(() => {
    restoreDom?.();
    restoreDom = null;
  });

  it.each([
    { label: "page editor", compress: compressEditorImage, expectedWidth: 1400 },
    { label: "site settings", compress: compressSiteImage, expectedWidth: 1200 },
  ])("resizes and exports %s images as webp", async ({ compress, expectedWidth }) => {
    const dom = mockCompressionDom({ imageWidth: 4000, imageHeight: 2000 });
    restoreDom = dom.restore;

    const result = await compress(createFile());

    expect(result).toBe("data:image/webp;base64,compressed");
    expect(dom.drawImage).toHaveBeenCalledWith(expect.any(Object), 0, 0, expectedWidth, expectedWidth / 2);
    expect(dom.toDataURL).toHaveBeenCalledWith("image/webp", 0.72);
  });

  it("does not upscale images that are already smaller than the max width", async () => {
    const dom = mockCompressionDom({ imageWidth: 800, imageHeight: 400 });
    restoreDom = dom.restore;

    await compressEditorImage(createFile());

    expect(dom.drawImage).toHaveBeenCalledWith(expect.any(Object), 0, 0, 800, 400);
  });

  it("rejects when the canvas context is unavailable", async () => {
    const dom = mockCompressionDom({ hasContext: false });
    restoreDom = dom.restore;

    await expect(compressEditorImage(createFile())).rejects.toThrow("Canvas context unavailable");
  });
});
