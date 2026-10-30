import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useImageUpload } from "./useImageUpload";
import { compressImage } from "../utils/imageUtils";

vi.mock("../utils/imageUtils", () => ({
  compressImage: vi.fn(),
}));

function createFile(name = "asset.png", type = "image/png", size = 16) {
  return new File([new Uint8Array(size)], name, { type });
}

function createDependencies(backgroundType = "color") {
  return {
    pendingInsertPointRef: { current: { x: 42, y: 84 } },
    backgroundType,
    actions: {
      addImage: vi.fn(),
      addGalleryImages: vi.fn(),
      addVideo: vi.fn(),
    },
    setters: {
      setBackgroundImage: vi.fn(),
      setBackgroundType: vi.fn(),
    },
    setQuickMenu: vi.fn(),
  };
}

describe("useImageUpload", () => {
  const compressImageMock = vi.mocked(compressImage);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("compresses and inserts a picked image at the pending insert point", async () => {
    compressImageMock.mockResolvedValueOnce("data:image/webp;base64,compressed-image");
    const deps = createDependencies();
    const { result } = renderHook(() => useImageUpload(deps));
    const file = createFile();
    const target = { files: [file], value: "selected" } as unknown as HTMLInputElement;

    await act(async () => {
      await result.current.onPickImage({
        target,
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(compressImageMock).toHaveBeenCalledWith(file, 1400, 0.72);
    expect(deps.actions.addImage).toHaveBeenCalledWith(
      "data:image/webp;base64,compressed-image",
      42,
      84
    );
    expect(target.value).toBe("");
    expect(deps.setQuickMenu).toHaveBeenCalledWith(null);
  });

  it("compresses a background image and switches to image mode", async () => {
    compressImageMock.mockResolvedValueOnce("data:image/webp;base64,background");
    const deps = createDependencies("color");
    const { result } = renderHook(() => useImageUpload(deps));
    const file = createFile("background.png");
    const target = { files: [file], value: "selected" } as unknown as HTMLInputElement;

    await act(async () => {
      await result.current.onPickBgImage({
        target,
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(compressImageMock).toHaveBeenCalledWith(file, 1920, 0.8);
    expect(deps.setters.setBackgroundImage).toHaveBeenCalledWith(
      "data:image/webp;base64,background"
    );
    expect(deps.setters.setBackgroundType).toHaveBeenCalledWith("image");
    expect(target.value).toBe("");
  });

  it("compresses all selected gallery images before inserting them", async () => {
    compressImageMock
      .mockResolvedValueOnce("data:image/webp;base64,gallery-1")
      .mockResolvedValueOnce("data:image/webp;base64,gallery-2");
    const randomSpy = vi.spyOn(Math, "random");
    randomSpy.mockReturnValueOnce(0.111111111).mockReturnValueOnce(0.222222222);

    const deps = createDependencies();
    const { result } = renderHook(() => useImageUpload(deps));
    const firstFile = createFile("one.png");
    const secondFile = createFile("two.png");
    const target = {
      files: [firstFile, secondFile],
      value: "selected",
    } as unknown as HTMLInputElement;

    await act(async () => {
      await result.current.onPickGallery({
        target,
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(compressImageMock).toHaveBeenNthCalledWith(1, firstFile, 1400, 0.72);
    expect(compressImageMock).toHaveBeenNthCalledWith(2, secondFile, 1400, 0.72);
    expect(deps.actions.addGalleryImages).toHaveBeenCalledTimes(1);

    const [images, x, y] = deps.actions.addGalleryImages.mock.calls[0];
    expect(images).toHaveLength(2);
    expect(images[0]).toEqual(expect.objectContaining({ src: "data:image/webp;base64,gallery-1" }));
    expect(images[1]).toEqual(expect.objectContaining({ src: "data:image/webp;base64,gallery-2" }));
    expect(typeof images[0].id).toBe("string");
    expect(typeof images[1].id).toBe("string");
    expect(x).toBe(42);
    expect(y).toBe(84);
    expect(target.value).toBe("");
    expect(deps.setQuickMenu).toHaveBeenCalledWith(null);

    randomSpy.mockRestore();
  });

  it("rejects videos larger than 100 MB before reading them", async () => {
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    const deps = createDependencies();
    const { result } = renderHook(() => useImageUpload(deps));
    const file = createFile("clip.mp4", "video/mp4");
    Object.defineProperty(file, "size", { value: 101 * 1024 * 1024 });
    const target = { files: [file], value: "selected" } as unknown as HTMLInputElement;

    await act(async () => {
      await result.current.onPickVideo({
        target,
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(alertSpy).toHaveBeenCalledWith("Video too large (max 100 MB). Choose a smaller file.");
    expect(deps.actions.addVideo).not.toHaveBeenCalled();
    expect(target.value).toBe("");

    alertSpy.mockRestore();
  });

  it("reads a selected video and inserts it at the pending point", async () => {
    const originalFileReader = globalThis.FileReader;

    class MockFileReader {
      result = "data:video/mp4;base64,clip-data";
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;

      readAsDataURL() {
        this.onload?.();
      }
    }

    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    const deps = createDependencies();
    const { result } = renderHook(() => useImageUpload(deps));
    const file = createFile("clip.mp4", "video/mp4");
    const target = { files: [file], value: "selected" } as unknown as HTMLInputElement;

    await act(async () => {
      await result.current.onPickVideo({
        target,
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(deps.actions.addVideo).toHaveBeenCalledWith("data:video/mp4;base64,clip-data", 42, 84);
    expect(target.value).toBe("");
    expect(deps.setQuickMenu).toHaveBeenCalledWith(null);

    globalThis.FileReader = originalFileReader;
  });
});
