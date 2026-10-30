import { useEffect, useRef, useState } from "react";

/** Width used by the visual editors when positioning blocks. */
export const PUBLIC_CANVAS_WIDTH = 1200;

/**
 * Measures the available width and returns the scale required to keep a
 * fixed-size visual composition entirely visible. The composition is only
 * reduced: wide screens keep the exact size used in the back-office.
 */
export function useResponsiveCanvas(designWidth = PUBLIC_CANVAS_WIDTH) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const viewportWidth = Math.min(
        window.innerWidth || designWidth,
        document.documentElement.clientWidth || designWidth,
        window.visualViewport?.width || designWidth
      );
      const availableWidth = Math.min(container.clientWidth || viewportWidth, viewportWidth);
      setScale(availableWidth > 0 ? Math.min(1, availableWidth / designWidth) : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    window.addEventListener("resize", updateScale);
    window.visualViewport?.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
      window.visualViewport?.removeEventListener("resize", updateScale);
    };
  }, [designWidth]);

  return { containerRef, scale, designWidth };
}
