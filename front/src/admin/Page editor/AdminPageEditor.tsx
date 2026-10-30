import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useEditorLogic } from "./editorLogic";
import { getCanvasPoint } from "./editorMathCalcul";
import { getPageGradientConfig } from "../../utils/gradients";
import { inputStyle, plainButtonStyle, dangerButtonStyle, editorPanelStyle } from "./editorStyles";
import { EditorErrorBoundary } from "./components/EditorErrorBoundary";
import { CanvasBlock } from "./components/canvas/CanvasBlock";
import { TextBlock } from "./components/canvas/TextBlock";
import { BlockContextMenu } from "./components/menus/BlockContextMenu";
import { CanvasContextMenu } from "./components/menus/CanvasContextMenu";
import { FlipBackContextMenu } from "./components/menus/FlipBackContextMenu";
import { TextSelectionContextMenu } from "./components/menus/TextSelectionContextMenu";
import { PropertiesPanel } from "./components/panels/PropertiesPanel";
import { Toolbar } from "./components/Toolbar";
import { MultiSelectionBar } from "./components/MultiSelectionBar";
import { PageSettingsPanel } from "./components/PageSettingsPanel";
import { useToast } from "./hooks/useToast";
import { useTextEditing } from "./hooks/useTextEditing";
import { useImageUpload } from "./hooks/useImageUpload";
import { useQuickMenu } from "./hooks/useQuickMenu";

export default function AdminPageEditor({ slugOverride }: { slugOverride?: string } = {}) {
  const { "*": urlSlug } = useParams();
  const slug = slugOverride ?? urlSlug;
  const isFooter = slug === "__footer__";
  const { states, actions, setters, handlers } = useEditorLogic(slug);

  const {
    title,
    navLabel,
    showInNav,
    backgroundType,
    backgroundColor,
    backgroundImage,
    backgroundGradient,
    backgroundGradientStart,
    backgroundGradientEnd,
    backgroundGradientAngle,
    overlayEnabled,
    overlayColor,
    overlayOpacity,
    blocks,
    selectedId,
    selected,
    canvasHeight,
    modes,
    textColor,
    boxColor,
    defaultFontStyle,
    isDirty,
    selectedIds,
    flipBackEditId,
    selectedBackBlockId,
    selectedBackBlock,
  } = states;

  const canvasRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pendingInsertPointRef = useRef<{ x: number; y: number }>({ x: 100, y: 100 });
  const [hoveredRevealTag, setHoveredRevealTag] = useState<string | null>(null);

  const { toast, showToast } = useToast();

  const {
    registerTextBlockRef,
    commitTextBlockDom,
    getTextSelectionForBlock,
    syncSelectedTextClipboard,
  } = useTextEditing({ blocks, actions });

  const {
    fileInputRef,
    bgImageFileInputRef,
    videoInputRef,
    onPickImage,
    onPickBgImage,
    onPickGallery,
    onPickVideo,
  } = useImageUpload({
    pendingInsertPointRef,
    backgroundType,
    actions,
    setters,
    setQuickMenu: (v) => setQuickMenu(v),
  });

  const { quickMenu, setQuickMenu, menuRef, quickSelectedBlock, openBlockMenu, openCanvasMenu } =
    useQuickMenu({
      blocks,
      pendingInsertPointRef,
      canvasRef,
      setters,
      commitTextBlockDom,
      getTextSelectionForBlock,
    });

  const highestZIndex = useMemo(
    () =>
      blocks.reduce(
        (highest, block) => Math.max(highest, Number.isFinite(block?.zIndex) ? block.zIndex : 1),
        1
      ),
    [blocks]
  );

  const sortedBlocks = useMemo(
    () => [...blocks].sort((a, b) => (Number(a?.zIndex) || 1) - (Number(b?.zIndex) || 1)),
    [blocks]
  );

  const pageGradientConfig = getPageGradientConfig({
    backgroundGradientStart,
    backgroundGradientEnd,
    backgroundGradientAngle,
  });
  const currentBgColor = backgroundColor === "transparent" ? "#2a2424" : backgroundColor;

  const pageCanvasBackground =
    backgroundType === "gradient"
      ? backgroundGradient || "linear-gradient(135deg, #2a2424 0%, #433a68 100%)"
      : backgroundType === "color" && backgroundColor && backgroundColor !== "transparent"
        ? backgroundColor
        : "#2a2424";

  function openFlipBackMenu(e: React.MouseEvent, flipCardId: string) {
    const flipCard = blocks.find((b) => b.id === flipCardId);
    if (!flipCard || !canvasRef.current) return;
    const canvasPoint = getCanvasPoint(e, canvasRef.current);
    const relX = canvasPoint.x - (flipCard.x ?? 0);
    const relY = canvasPoint.y - (flipCard.y ?? 0);
    setQuickMenu({
      type: "flipBack",
      x: e.clientX,
      y: e.clientY,
      point: { x: relX, y: relY },
      flipCardId,
    });
  }

  function syncPastePointFromMouse(event: React.MouseEvent) {
    if (!canvasRef.current) return;
    const point = getCanvasPoint(event, canvasRef.current);
    pendingInsertPointRef.current = point;
    setters.setPastePoint(point);
  }

  function syncPastePointFromViewport() {
    if (!canvasRef.current || !viewportRef.current) return;
    const viewportRect = viewportRef.current.getBoundingClientRect();
    const point = getCanvasPoint(
      {
        clientX: viewportRect.left + viewportRef.current.clientWidth / 2,
        clientY: viewportRect.top + viewportRef.current.clientHeight / 2,
      },
      canvasRef.current
    );
    pendingInsertPointRef.current = point;
    setters.setPastePoint(point);
  }

  if (!title && !states.page) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <EditorErrorBoundary>
      <div
        style={{
          display: "grid",
          gap: 20,
          color: "#f5f5fb",
          padding: 0,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif",
          minHeight: "100vh",
          position: "relative",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#8ea2ff",
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              {isFooter ? "Footer editor" : "Page editor"}
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 32,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                background: "linear-gradient(180deg,#fff 0%,#b4b4d8 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {isFooter ? "Footer" : slug}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <a
              href={slug === "home" ? "/" : `/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...plainButtonStyle, textDecoration: "none" }}
            >
              Preview ↗
            </a>
          </div>
        </div>

        {/* Page meta */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <label style={{ display: "grid", gap: 6, flex: 1 }}>
            Page title (H1)
            <input
              value={title}
              onChange={(e) => setters.setTitle(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: "grid", gap: 6, flex: 1 }}>
            Navbar label
            <input
              value={navLabel}
              onChange={(e) => setters.setNavLabel(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              alignSelf: "end",
              paddingBottom: 8,
            }}
          >
            <input
              type="checkbox"
              checked={showInNav}
              onChange={(e) => setters.setShowInNav(e.target.checked)}
            />
            Show in nav
          </label>
        </div>

        {/* Background + font settings */}
        <PageSettingsPanel
          backgroundType={backgroundType}
          currentBgColor={currentBgColor}
          pageGradientConfig={pageGradientConfig}
          backgroundGradient={backgroundGradient}
          backgroundImage={backgroundImage}
          defaultFontStyle={defaultFontStyle}
          bgImageFileInputRef={bgImageFileInputRef}
          onPickBgImage={onPickBgImage}
          setters={setters}
        />

        {/* Toolbar */}
        <Toolbar
          modes={modes}
          textColor={textColor}
          boxColor={boxColor}
          isDirty={isDirty}
          pendingInsertPointRef={pendingInsertPointRef}
          fileInputRef={fileInputRef}
          galleryInputRef={galleryInputRef}
          videoInputRef={videoInputRef}
          onPickImage={onPickImage}
          onPickGallery={onPickGallery}
          onPickVideo={onPickVideo}
          setters={setters}
          actions={actions}
          showToast={showToast}
        />

        {/* Multi-selection alignment bar */}
        <MultiSelectionBar selectedIds={selectedIds} actions={actions} setters={setters} />

        {/* Canvas viewport */}
        <div
          ref={viewportRef}
          style={{
            width: "100%",
            height: "calc(100vh - 160px)",
            minHeight: "50vh",
            overflow: "auto",
            background: backgroundType === "image" ? undefined : pageCanvasBackground,
            backgroundImage:
              backgroundType === "image" && backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: backgroundType === "image" ? "cover" : undefined,
            backgroundPosition: backgroundType === "image" ? "center" : undefined,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.2)",
            transition: "width 0.25s ease, height 0.25s ease",
          }}
          onMouseMove={(e) => {
            syncPastePointFromMouse(e);
            handlers.handleMouseMove(e, canvasRef);
          }}
          onScroll={syncPastePointFromViewport}
          onMouseUp={handlers.stop}
          onMouseLeave={handlers.stop}
          onClick={(e) => handlers.onWrapperClick(e, canvasRef)}
        >
          <div
            ref={canvasRef}
            onContextMenu={openCanvasMenu}
            style={{
              width: "100%",
              minWidth: 1200,
              height: Math.max(canvasHeight, 1000),
              position: "relative",
              margin: "0 auto",
            }}
          >
            {overlayEnabled && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: overlayColor || "#000000",
                  opacity: overlayOpacity ?? 0.25,
                  pointerEvents: "none",
                }}
              />
            )}

            {sortedBlocks.map((block) => {
              const isSelected = selectedId === block.id;
              const isInSelection =
                !isSelected && selectedIds.length > 1 && selectedIds.includes(block.id);

              if (block.type === "text") {
                return (
                  <TextBlock
                    key={block.id}
                    block={block}
                    isSelected={isSelected}
                    isInSelection={isInSelection}
                    canvasRef={canvasRef}
                    handlers={handlers}
                    actions={actions}
                    onSetSelectedId={setters.setSelectedId}
                    onOpenMenu={openBlockMenu}
                    onRegisterRef={registerTextBlockRef}
                    onGetTextSelection={getTextSelectionForBlock}
                    onSyncTextClipboard={syncSelectedTextClipboard}
                    hoveredRevealTag={hoveredRevealTag}
                    onRevealHover={setHoveredRevealTag}
                  />
                );
              }

              return (
                <CanvasBlock
                  key={block.id}
                  block={block}
                  isSelected={isSelected}
                  isInSelection={isInSelection}
                  canvasRef={canvasRef}
                  actions={actions}
                  handlers={handlers}
                  onOpenMenu={openBlockMenu}
                  onOpenBackFaceMenu={openFlipBackMenu}
                  allBlocks={blocks}
                  hoveredRevealTag={hoveredRevealTag}
                  onRevealHover={setHoveredRevealTag}
                  flipBackEditId={flipBackEditId}
                  selectedBackBlockId={selectedBackBlockId}
                />
              );
            })}
          </div>
        </div>

        {/* Properties panel — back block takes priority */}
        {(selectedBackBlock || selected) && (
          <div style={editorPanelStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>
                {selectedBackBlock ? `Back · ${selectedBackBlock.type}` : `Edit: ${selected!.type}`}
              </h3>
              <div style={{ display: "flex", gap: 8 }}>
                {selectedBackBlock ? (
                  <>
                    <button
                      onClick={() =>
                        actions.duplicateBackBlock(flipBackEditId!, selectedBackBlock.id)
                      }
                      style={plainButtonStyle}
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => actions.deleteBackBlock(flipBackEditId!, selectedBackBlock.id)}
                      style={dangerButtonStyle}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => actions.duplicateBlock(selected!.id)}
                      style={plainButtonStyle}
                    >
                      Duplicate
                    </button>
                    <button
                      onClick={() => actions.deleteBlock(selected!.id)}
                      style={dangerButtonStyle}
                    >
                      Delete block
                    </button>
                  </>
                )}
              </div>
            </div>
            <PropertiesPanel
              hideHeader
              selected={selectedBackBlock ?? selected}
              actions={
                selectedBackBlock
                  ? {
                      ...actions,
                      updateSelected: (patch: any) =>
                        actions.updateBackBlockById(flipBackEditId!, selectedBackBlock.id, patch),
                    }
                  : actions
              }
              highestZIndex={highestZIndex}
              pendingInsertPointRef={pendingInsertPointRef}
              galleryInputRef={galleryInputRef}
            />
          </div>
        )}

        {/* Context menus */}
        {quickMenu?.type === "canvas" && (
          <CanvasContextMenu
            quickMenu={quickMenu}
            menuRef={menuRef}
            actions={actions}
            setQuickMenu={setQuickMenu}
            setters={setters}
            fileInputRef={fileInputRef}
            pendingInsertPointRef={pendingInsertPointRef}
          />
        )}

        {quickMenu?.type === "block" && quickSelectedBlock && (
          <BlockContextMenu
            quickMenu={quickMenu}
            menuRef={menuRef}
            quickSelectedBlock={quickSelectedBlock}
            actions={actions}
            setQuickMenu={setQuickMenu}
            selectedIds={selectedIds}
          />
        )}

        {quickMenu?.type === "flipBack" && (
          <FlipBackContextMenu
            quickMenu={quickMenu}
            menuRef={menuRef}
            actions={actions}
            setQuickMenu={setQuickMenu}
            flipBackEditId={quickMenu.flipCardId}
            selectedBackBlockId={selectedBackBlockId}
          />
        )}

        {quickMenu?.type === "textSelection" && quickSelectedBlock?.type === "text" && (
          <TextSelectionContextMenu
            quickMenu={quickMenu}
            menuRef={menuRef}
            quickSelectedBlock={quickSelectedBlock}
            actions={actions}
          />
        )}

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "12px 28px",
              borderRadius: 12,
              background: toast.type === "error" ? "rgba(220,38,38,0.95)" : "rgba(16,185,129,0.95)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 14,
              zIndex: 9999,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              fontFamily: "inherit",
            }}
          >
            {toast.message}
          </div>
        )}
      </div>
    </EditorErrorBoundary>
  );
}
