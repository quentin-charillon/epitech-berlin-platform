import { NavigationBar } from "../../components/Navbar";
import { styleToCss } from "./utils";
import { resizeHandleStyle } from "./QuickMenus";

export function HeaderPreview({
  previewOuterRef,
  previewRef,
  realPreviewWidth,
  previewHeight,
  previewScale,
  header,
  blocks,
  selectedBlockId,
  editingTextBlockId,
  beginDrag,
  beginResize,
  beginBackgroundDrag,
  openBlockMenu,
  openCanvasMenu,
  updateBlock,
  openBlockLink,
  setSelectedBlockId,
  setEditingTextBlockId,
}) {
  const submenuPreviewSpace = 260;
  const previewWorkspaceHeight = previewHeight + submenuPreviewSpace;
  const previewBackgroundPosition = `${
    Number.isFinite(header.backgroundPositionX) ? header.backgroundPositionX : 50
  }% ${Number.isFinite(header.backgroundPositionY) ? header.backgroundPositionY : 50}%`;

  const hasBackgroundImage =
    header.backgroundType === "image" &&
    typeof header.backgroundImage === "string" &&
    header.backgroundImage.trim() !== "";

  return (
    <div ref={previewOuterRef} className="adminPreviewWrapper" style={{ marginBottom: 24 }}>
      <div
        style={{
          width: realPreviewWidth * previewScale,
          height: previewWorkspaceHeight * previewScale,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          ref={previewRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: realPreviewWidth,
            height: previewHeight,
            transform: `scale(${previewScale})`,
            transformOrigin: "top left",
            overflow: "visible",
            backgroundColor: header.backgroundColor || "#3a3a3a",
            backgroundImage: hasBackgroundImage
              ? `linear-gradient(rgba(0,0,0,${header.overlayOpacity ?? 0.35}), rgba(0,0,0,${header.overlayOpacity ?? 0.35})), url(${header.backgroundImage})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: previewBackgroundPosition,
            backgroundRepeat: "no-repeat",
            border: "1px solid rgba(255,255,255,0.08)",
            userSelect: "none",
            cursor: hasBackgroundImage ? "grab" : "default",
          }}
          onContextMenu={openCanvasMenu}
          onMouseDown={(e) => {
            if (e.target === previewRef.current && hasBackgroundImage) {
              beginBackgroundDrag(e);
              return;
            }
            setSelectedBlockId(null);
            setEditingTextBlockId(null);
          }}
        >
          {blocks.map((block) => {
            const isSelected = selectedBlockId === block.id;
            const commonStyle = {
              position: "absolute" as const,
              left: block.x ?? 0,
              top: block.y ?? 0,
              cursor: editingTextBlockId === block.id ? "text" : "move",
              outline: isSelected ? "2px solid #7aa2ff" : "1px dashed rgba(255,255,255,0.18)",
              outlineOffset: 2,
              zIndex: block.zIndex ?? 1,
            };

            if (block.type === "text") {
              return (
                <div
                  key={block.id}
                  onMouseDown={(e) => beginDrag(e, block)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if ((e.ctrlKey || e.metaKey) && block.linkTarget) {
                      openBlockLink(block);
                      return;
                    }
                    setSelectedBlockId(block.id);
                  }}
                  onContextMenu={(e) => openBlockMenu(e, block.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setSelectedBlockId(block.id);
                    setEditingTextBlockId(block.id);
                  }}
                  style={{
                    ...commonStyle,
                    color: block.color ?? "#ffffff",
                    fontSize: block.fontSize ?? 20,
                    whiteSpace: "pre-wrap",
                    padding: "2px 4px",
                    maxWidth: 500,
                    ...styleToCss(block.fontStyle),
                  }}
                >
                  {editingTextBlockId === block.id ? (
                    <textarea
                      autoFocus
                      value={block.text ?? ""}
                      onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                      onBlur={() => setEditingTextBlockId(null)}
                      onMouseDown={(e) => e.stopPropagation()}
                      style={{
                        minWidth: 120,
                        minHeight: 36,
                        background: "rgba(0,0,0,0.45)",
                        color: block.color ?? "#ffffff",
                        border: "1px solid rgba(255,255,255,0.25)",
                        borderRadius: 8,
                        padding: "6px 8px",
                        outline: "none",
                        resize: "none",
                        fontSize: block.fontSize ?? 20,
                        fontFamily: "inherit",
                        ...styleToCss(block.fontStyle),
                      }}
                    />
                  ) : (
                    block.text || "Text"
                  )}
                  <div onMouseDown={(e) => beginResize(e, block)} style={resizeHandleStyle} />
                </div>
              );
            }

            if (block.type === "image") {
              return (
                <div
                  key={block.id}
                  onMouseDown={(e) => beginDrag(e, block)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if ((e.ctrlKey || e.metaKey) && block.linkTarget) {
                      openBlockLink(block);
                      return;
                    }
                    setSelectedBlockId(block.id);
                    setEditingTextBlockId(null);
                  }}
                  onContextMenu={(e) => openBlockMenu(e, block.id)}
                  style={{
                    ...commonStyle,
                    width: block.w ?? 140,
                    height: block.h ?? 80,
                    borderRadius: block.borderRadius ?? 12,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.08)",
                  }}
                >
                  {block.src ? (
                    <img
                      src={block.src}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        pointerEvents: "none",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255,255,255,0.65)",
                        fontSize: 14,
                        pointerEvents: "none",
                      }}
                    >
                      Image
                    </div>
                  )}
                  <div onMouseDown={(e) => beginResize(e, block)} style={resizeHandleStyle} />
                </div>
              );
            }

            if (block.type === "box") {
              return (
                <div
                  key={block.id}
                  onMouseDown={(e) => beginDrag(e, block)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if ((e.ctrlKey || e.metaKey) && block.linkTarget) {
                      openBlockLink(block);
                      return;
                    }
                    setSelectedBlockId(block.id);
                    setEditingTextBlockId(null);
                  }}
                  onContextMenu={(e) => openBlockMenu(e, block.id)}
                  style={{
                    ...commonStyle,
                    width: block.w ?? 180,
                    height: block.h ?? 70,
                    boxSizing: "border-box",
                    background: block.transparent ? "transparent" : (block.color ?? "#5b4cf0"),
                    opacity: block.opacity ?? 1,
                    border: block.borderEnabled
                      ? `${block.borderWidth ?? 2}px solid ${block.borderColor ?? "#ffffff"}`
                      : "none",
                    borderRadius: block.borderRadius ?? 16,
                  }}
                >
                  <div onMouseDown={(e) => beginResize(e, block)} style={resizeHandleStyle} />
                </div>
              );
            }

            return null;
          })}

          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 4,
              pointerEvents: "none",
            }}
          >
            <NavigationBar navigationSettings={header.navigation} />
          </div>
        </div>
      </div>
    </div>
  );
}
