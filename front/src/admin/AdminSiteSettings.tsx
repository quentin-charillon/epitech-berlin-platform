import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hasBlockClipboard, readPastedBlock, writeBlockClipboard } from "../utils/blockClipboard";
import { popHistoryEntry, pushHistoryEntry } from "../utils/historyState";
import {
  API_BASE,
  clamp,
  compressImage,
  defaultSettings,
  normalizeSiteSettings,
  normalizePreviewLinkTarget,
  uid,
} from "./siteSettings/utils";
import { HeaderPreview } from "./siteSettings/HeaderPreview";
import { HeaderSettingsPanel } from "./siteSettings/HeaderSettingsPanel";
import { SelectedBlockPanel } from "./siteSettings/SelectedBlockPanel";
import { BlockQuickMenu, CanvasQuickMenu } from "./siteSettings/QuickMenus";
import { PUBLIC_CANVAS_WIDTH } from "../utils/responsiveCanvas";

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [savedMessage, setSavedMessage] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [editingTextBlockId, setEditingTextBlockId] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);
  const realPreviewWidth = PUBLIC_CANVAS_WIDTH;
  const [isLoading, setIsLoading] = useState(true);
  const [quickMenu, setQuickMenu] = useState(null);

  const previewOuterRef = useRef(null);
  const previewRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const blockImageInputRef = useRef(null);
  const pendingBlockImageIdRef = useRef(null);
  const quickMenuRef = useRef(null);
  const pendingInsertPointRef = useRef({ x: 40, y: 20 });

  const dragStateRef = useRef({
    mode: null,
    blockId: null,
    startMouseX: 0,
    startMouseY: 0,
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0,
    startFontSize: 0,
    startBackgroundX: 50,
    startBackgroundY: 50,
  });
  const historyRef = useRef([]);
  const interactionHistoryRef = useRef({
    draggingId: null,
    resizingId: null,
    background: false,
  });

  const header = settings?.header || {};
  const blocks = Array.isArray(header.blocks) ? header.blocks : [];
  const previewHeight = Math.max(80, Number(header.height) || 120);

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedBlockId) || null,
    [blocks, selectedBlockId]
  );

  const quickMenuBlock = useMemo(
    () =>
      quickMenu?.type === "block"
        ? blocks.find((block) => block.id === quickMenu.blockId) || null
        : null,
    [blocks, quickMenu]
  );

  // --- History ---

  const rememberHistory = useCallback(
    (snapshot = { settings, selectedBlockId, editingTextBlockId }) => {
      pushHistoryEntry(historyRef, snapshot);
    },
    [editingTextBlockId, selectedBlockId, settings]
  );

  function restoreSnapshot(snapshot) {
    if (!snapshot) return;
    setSettings(snapshot.settings || defaultSettings);
    setSelectedBlockId(snapshot.selectedBlockId ?? null);
    setEditingTextBlockId(snapshot.editingTextBlockId ?? null);
    dragStateRef.current.mode = null;
    dragStateRef.current.blockId = null;
    interactionHistoryRef.current = { draggingId: null, resizingId: null, background: false };
  }

  // --- API ---

  async function loadFromApi() {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE}/api/site-settings`);
      if (!response.ok) throw new Error("Failed to load site settings");
      const data = await response.json();
      historyRef.current = [];
      interactionHistoryRef.current = { draggingId: null, resizingId: null, background: false };
      setSettings(normalizeSiteSettings(data));
    } catch (error) {
      console.error(error);
      alert("Unable to load site settings from the server.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/site-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        const raw = await response.text();
        throw new Error(raw || "Failed to save site settings");
      }
      const saved = await response.json();
      setSettings(normalizeSiteSettings(saved));
      window.dispatchEvent(new Event("site:changed"));
      localStorage.setItem("site-settings-updated", String(Date.now()));
      setSavedMessage("Header saved ✅");
      setTimeout(() => setSavedMessage(""), 2200);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? `Unable to save the header: ${error.message}`
          : "Unable to save the header to the server."
      );
    }
  }

  // --- Header fields ---

  function setHeaderField(key, value) {
    rememberHistory();
    setSettings((prev) => ({ ...prev, header: { ...prev.header, [key]: value } }));
  }

  // --- Block mutations ---

  const updateBlock = useCallback(
    (blockId, patch, options: any = {}) => {
      if (!options.skipHistory) rememberHistory();
      setSettings((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          blocks: (prev.header?.blocks || []).map((b) =>
            b.id === blockId ? { ...b, ...patch } : b
          ),
        },
      }));
    },
    [rememberHistory]
  );

  const deleteBlock = useCallback(
    (blockId) => {
      rememberHistory();
      setSettings((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          blocks: (prev.header?.blocks || []).filter((b) => b.id !== blockId),
        },
      }));
      setSelectedBlockId((prev) => (prev === blockId ? null : prev));
      setEditingTextBlockId((prev) => (prev === blockId ? null : prev));
    },
    [rememberHistory]
  );

  function addBlock(block: any) {
    rememberHistory();
    setSettings((prev) => ({
      ...prev,
      header: { ...prev.header, blocks: [...(prev.header?.blocks || []), block] },
    }));
    return block;
  }

  function addTextBlock(position: any = {}) {
    const block = {
      id: "h_txt_" + uid(),
      type: "text",
      x: position.x ?? 40,
      y: position.y ?? 20,
      text: "New text",
      fontSize: 28,
      color: "#ffffff",
      fontStyle: "bold",
    };
    addBlock(block);
    setSelectedBlockId(block.id);
    setEditingTextBlockId(block.id);
  }

  function addImageBlock(position: any = {}) {
    const block = {
      id: "h_img_" + uid(),
      type: "image",
      x: position.x ?? 420,
      y: position.y ?? 10,
      w: 140,
      h: 80,
      src: "",
      borderRadius: 12,
      linkTarget: "",
    };
    addBlock(block);
    setSelectedBlockId(block.id);
  }

  function addImageLinkBlock(position: any = {}, openPicker = true) {
    const block = {
      id: "h_img_link_" + uid(),
      type: "image",
      x: position.x ?? 40,
      y: position.y ?? 12,
      w: 160,
      h: 84,
      src: "",
      borderRadius: 12,
      linkTarget: "https://",
    };
    addBlock(block);
    setSelectedBlockId(block.id);
    setEditingTextBlockId(null);
    if (openPicker) {
      pendingBlockImageIdRef.current = block.id;
      setTimeout(() => blockImageInputRef.current?.click(), 0);
    }
  }

  function addBoxBlock(position: any = {}) {
    const block = {
      id: "h_box_" + uid(),
      type: "box",
      x: position.x ?? 30,
      y: position.y ?? 10,
      w: 180,
      h: 70,
      color: "#5b4cf0",
      borderRadius: 16,
      transparent: false,
      opacity: 1,
      borderEnabled: false,
      borderColor: "#ffffff",
      borderWidth: 2,
      zIndex: 1,
    };
    addBlock(block);
    setSelectedBlockId(block.id);
  }

  // --- Clipboard ---

  const copySelectedBlock = useCallback(() => {
    if (!selectedBlock) return false;
    return writeBlockClipboard(selectedBlock);
  }, [selectedBlock]);

  const copyBlock = useCallback(
    (blockId) => {
      const block = blocks.find((item) => item.id === blockId);
      if (!block) return false;
      return writeBlockClipboard(block);
    },
    [blocks]
  );

  const cutSelectedBlock = useCallback(() => {
    if (!selectedBlockId || !selectedBlock) return false;
    writeBlockClipboard(selectedBlock);
    deleteBlock(selectedBlockId);
    return true;
  }, [deleteBlock, selectedBlock, selectedBlockId]);

  const cutBlock = useCallback(
    (blockId) => {
      const block = blocks.find((item) => item.id === blockId);
      if (!block) return false;
      writeBlockClipboard(block);
      deleteBlock(blockId);
      return true;
    },
    [blocks, deleteBlock]
  );

  function validatePastedBlock(block) {
    if (!block || !["text", "image", "box"].includes(block.type)) {
      if (block) alert("The header editor only supports text, image and box blocks.");
      return false;
    }
    return true;
  }

  const pasteCopiedBlock = useCallback(() => {
    const pastedBlock = readPastedBlock();
    if (!validatePastedBlock(pastedBlock)) return false;
    rememberHistory();
    setSettings((prev) => ({
      ...prev,
      header: { ...prev.header, blocks: [...(prev.header?.blocks || []), pastedBlock] },
    }));
    setSelectedBlockId(pastedBlock.id);
    setEditingTextBlockId(null);
    return true;
  }, [rememberHistory]);

  const pasteCopiedBlockAt = useCallback(
    (x, y) => {
      const pastedBlock = readPastedBlock();
      if (!validatePastedBlock(pastedBlock)) return false;
      const nextBlock = {
        ...pastedBlock,
        x: Number.isFinite(x) ? x : (pastedBlock.x ?? 0),
        y: Number.isFinite(y) ? y : (pastedBlock.y ?? 0),
      };
      rememberHistory();
      setSettings((prev) => ({
        ...prev,
        header: { ...prev.header, blocks: [...(prev.header?.blocks || []), nextBlock] },
      }));
      setSelectedBlockId(nextBlock.id);
      setEditingTextBlockId(null);
      return true;
    },
    [rememberHistory]
  );

  // --- File uploads ---

  async function handleBackgroundUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 1600, 0.72);
      rememberHistory();
      setSettings((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          backgroundType: "image",
          backgroundImage: dataUrl,
          backgroundPositionX: 50,
          backgroundPositionY: 50,
        },
      }));
    } catch (error) {
      console.error(error);
      alert("Unable to compress this image.");
    } finally {
      event.target.value = "";
    }
  }

  function clearBackgroundImage() {
    rememberHistory();
    setSettings((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        backgroundType: "color",
        backgroundImage: "",
        backgroundPositionX: 50,
        backgroundPositionY: 50,
      },
    }));
  }

  async function handleSelectedBlockImageUpload(event) {
    const file = event.target.files?.[0];
    const targetBlockId = pendingBlockImageIdRef.current || selectedBlockId;
    const targetBlock = blocks.find((block) => block.id === targetBlockId);
    if (!file || !targetBlock || targetBlock.type !== "image") return;
    try {
      const dataUrl = await compressImage(file, 1200, 0.72);
      updateBlock(targetBlock.id, { src: dataUrl });
      setSelectedBlockId(targetBlock.id);
    } catch (error) {
      console.error(error);
      alert("Unable to compress this image.");
    } finally {
      pendingBlockImageIdRef.current = null;
      event.target.value = "";
    }
  }

  function clearSelectedBlockImage() {
    if (!selectedBlock || selectedBlock.type !== "image") return;
    updateBlock(selectedBlock.id, { src: "" });
  }

  function openBlockLink(block: any) {
    const target = normalizePreviewLinkTarget(block?.linkTarget || block?.url);
    if (!target) return;
    window.open(target, "_blank", "noopener,noreferrer");
  }

  // --- Drag & resize ---

  function getPreviewPoint(event) {
    if (!previewRef.current) return { x: 40, y: 20 };
    const rect = previewRef.current.getBoundingClientRect();
    const scale = previewScale || 1;
    return {
      x: Math.max(0, Math.round((event.clientX - rect.left) / scale)),
      y: Math.max(0, Math.round((event.clientY - rect.top) / scale)),
    };
  }

  function beginDrag(event, block) {
    if (event.button !== 0) {
      event.stopPropagation();
      return;
    }
    if (editingTextBlockId === block.id) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedBlockId(block.id);
    if (interactionHistoryRef.current.draggingId !== block.id) {
      rememberHistory();
      interactionHistoryRef.current.draggingId = block.id;
    }
    dragStateRef.current = {
      mode: "move",
      blockId: block.id,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: block.x ?? 0,
      startY: block.y ?? 0,
      startW: block.w ?? 0,
      startH: block.h ?? 0,
      startFontSize: block.fontSize ?? 20,
      startBackgroundX: header.backgroundPositionX ?? 50,
      startBackgroundY: header.backgroundPositionY ?? 50,
    };
  }

  function beginResize(event, block) {
    if (event.button !== 0) {
      event.stopPropagation();
      return;
    }
    if (editingTextBlockId === block.id) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedBlockId(block.id);
    if (interactionHistoryRef.current.resizingId !== block.id) {
      rememberHistory();
      interactionHistoryRef.current.resizingId = block.id;
    }
    dragStateRef.current = {
      mode: "resize",
      blockId: block.id,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: block.x ?? 0,
      startY: block.y ?? 0,
      startW: block.w ?? 140,
      startH: block.h ?? 80,
      startFontSize: block.fontSize ?? 20,
      startBackgroundX: header.backgroundPositionX ?? 50,
      startBackgroundY: header.backgroundPositionY ?? 50,
    };
  }

  function beginBackgroundDrag(event) {
    if (event.button !== 0) return;
    if (!header.backgroundImage) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedBlockId(null);
    setEditingTextBlockId(null);
    if (!interactionHistoryRef.current.background) {
      rememberHistory();
      interactionHistoryRef.current.background = true;
    }
    dragStateRef.current = {
      mode: "background",
      blockId: null,
      startMouseX: event.clientX,
      startMouseY: event.clientY,
      startX: 0,
      startY: 0,
      startW: 0,
      startH: 0,
      startFontSize: 0,
      startBackgroundX: header.backgroundPositionX ?? 50,
      startBackgroundY: header.backgroundPositionY ?? 50,
    };
  }

  // --- Context menus ---

  function openBlockMenu(event, blockId) {
    event.preventDefault();
    event.stopPropagation();
    setSelectedBlockId(blockId);
    setEditingTextBlockId(null);
    setQuickMenu({ type: "block", blockId, x: event.clientX + 8, y: event.clientY + 8 });
  }

  function openCanvasMenu(event) {
    if (event.target !== previewRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    const point = getPreviewPoint(event);
    pendingInsertPointRef.current = point;
    setSelectedBlockId(null);
    setEditingTextBlockId(null);
    setQuickMenu({ type: "canvas", point, x: event.clientX + 8, y: event.clientY + 8 });
  }

  // --- Effects ---

  useEffect(() => {
    loadFromApi();
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!quickMenuRef.current) return;
      if (quickMenuRef.current.contains(event.target)) return;
      setQuickMenu(null);
    }
    function handleEscape(event) {
      if (event.key === "Escape") setQuickMenu(null);
    }
    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (quickMenu?.type === "block" && !quickMenuBlock) setQuickMenu(null);
  }, [quickMenu, quickMenuBlock]);

  useEffect(() => {
    function updatePreviewMetrics() {
      if (!previewOuterRef.current) return;
      const availableWidth = previewOuterRef.current.clientWidth - 32;
      const scale = Math.min(1, availableWidth / PUBLIC_CANVAS_WIDTH);
      setPreviewScale(scale > 0 ? scale : 1);
    }
    updatePreviewMetrics();
    window.addEventListener("resize", updatePreviewMetrics);
    return () => window.removeEventListener("resize", updatePreviewMetrics);
  }, []);

  useEffect(() => {
    function handleMouseMove(event) {
      const state = dragStateRef.current;
      if (!state.mode || !previewRef.current) return;
      const previewRect = previewRef.current.getBoundingClientRect();
      const dx = (event.clientX - state.startMouseX) / previewScale;
      const dy = (event.clientY - state.startMouseY) / previewScale;

      if (state.mode === "background") {
        const percentX = clamp(state.startBackgroundX - (dx / previewRect.width) * 100, 0, 100);
        const percentY = clamp(state.startBackgroundY - (dy / previewRect.height) * 100, 0, 100);
        setSettings((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            backgroundPositionX: Math.round(percentX * 10) / 10,
            backgroundPositionY: Math.round(percentY * 10) / 10,
          },
        }));
        return;
      }

      if (!state.blockId) return;
      const currentBlock = blocks.find((b) => b.id === state.blockId);
      if (!currentBlock) return;

      if (state.mode === "move") {
        const estimatedWidth =
          currentBlock.type === "text"
            ? Math.max(
                80,
                (currentBlock.text?.length || 8) * ((currentBlock.fontSize ?? 20) * 0.55)
              )
            : (currentBlock.w ?? 140);
        const estimatedHeight =
          currentBlock.type === "text"
            ? Math.max(28, (currentBlock.fontSize ?? 20) * 1.4)
            : (currentBlock.h ?? 80);
        const nextX = clamp(state.startX + dx, 0, Math.max(0, previewRect.width - estimatedWidth));
        const nextY = clamp(
          state.startY + dy,
          0,
          Math.max(0, previewRect.height - estimatedHeight)
        );
        updateBlock(
          state.blockId,
          { x: Math.round(nextX), y: Math.round(nextY) },
          { skipHistory: true }
        );
      }

      if (state.mode === "resize") {
        if (currentBlock.type === "text") {
          const nextFontSize = clamp(Math.round(state.startFontSize + dx / 4), 10, 120);
          updateBlock(state.blockId, { fontSize: nextFontSize }, { skipHistory: true });
          return;
        }
        const nextW = clamp(Math.round(state.startW + dx), 30, 4000);
        const nextH = clamp(Math.round(state.startH + dy), 20, 1200);
        updateBlock(state.blockId, { w: nextW, h: nextH }, { skipHistory: true });
      }
    }

    function handleMouseUp() {
      dragStateRef.current.mode = null;
      dragStateRef.current.blockId = null;
      interactionHistoryRef.current.draggingId = null;
      interactionHistoryRef.current.resizingId = null;
      interactionHistoryRef.current.background = false;
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [blocks, previewScale, header.backgroundPositionX, header.backgroundPositionY, updateBlock]);

  useEffect(() => {
    function handleKeyDown(e) {
      const active = document.activeElement;
      const tag = (active as any)?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || (active as any)?.isContentEditable;
      if (isTyping) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key.toLowerCase() === "z" && !e.shiftKey) {
        const previousSnapshot = popHistoryEntry(historyRef);
        if (!previousSnapshot) return;
        e.preventDefault();
        restoreSnapshot(previousSnapshot);
        return;
      }

      if (ctrl && e.key.toLowerCase() === "v") {
        if (!hasBlockClipboard()) return;
        e.preventDefault();
        pasteCopiedBlock();
        return;
      }

      if (!selectedBlockId) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteBlock(selectedBlockId);
        return;
      }

      if (!ctrl) return;

      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        copySelectedBlock();
      }
      if (e.key.toLowerCase() === "x") {
        e.preventDefault();
        cutSelectedBlock();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [copySelectedBlock, cutSelectedBlock, deleteBlock, pasteCopiedBlock, selectedBlockId]);

  // --- Render ---

  if (isLoading) {
    return <div style={{ color: "white", padding: 24 }}>Loading site settings...</div>;
  }

  return (
    <div style={{ color: "white", padding: "0 24px 24px" }}>
      <div className="adminPageHeader" style={{ paddingTop: 24 }}>
        <div className="adminPageHeaderTitle">
          <span className="adminPageEyebrow">Layout</span>
          <h1>Global header</h1>
          <p className="adminPageDescription">
            Customize the banner displayed at the top of every page: color, background image, and
            blocks (text, image, shape).
          </p>
        </div>
        <div className="adminPageActions">
          <button onClick={handleSave} className="adminBtn adminBtnPrimary adminBtnLg">
            <span>💾</span>
            <span>Save</span>
          </button>
          {savedMessage ? <span className="adminStatusOk">✓ {savedMessage}</span> : null}
        </div>
      </div>

      <div className="adminPreviewHint">
        <span>👁</span>
        <span>
          Preview scaled to fit your screen. Right-click to add a block, drag to reposition.
        </span>
      </div>

      <HeaderPreview
        previewOuterRef={previewOuterRef}
        previewRef={previewRef}
        realPreviewWidth={realPreviewWidth}
        previewHeight={previewHeight}
        previewScale={previewScale}
        header={header}
        blocks={blocks}
        selectedBlockId={selectedBlockId}
        editingTextBlockId={editingTextBlockId}
        beginDrag={beginDrag}
        beginResize={beginResize}
        beginBackgroundDrag={beginBackgroundDrag}
        openBlockMenu={openBlockMenu}
        openCanvasMenu={openCanvasMenu}
        updateBlock={updateBlock}
        openBlockLink={openBlockLink}
        setSelectedBlockId={setSelectedBlockId}
        setEditingTextBlockId={setEditingTextBlockId}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "380px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <HeaderSettingsPanel
          header={header}
          setHeaderField={setHeaderField}
          backgroundInputRef={backgroundInputRef}
          handleBackgroundUpload={handleBackgroundUpload}
          clearBackgroundImage={clearBackgroundImage}
          addTextBlock={addTextBlock}
          addImageBlock={addImageBlock}
          addImageLinkBlock={addImageLinkBlock}
          addBoxBlock={addBoxBlock}
        />
        <SelectedBlockPanel
          selectedBlock={selectedBlock}
          updateBlock={updateBlock}
          deleteBlock={deleteBlock}
          blockImageInputRef={blockImageInputRef}
          handleSelectedBlockImageUpload={handleSelectedBlockImageUpload}
          clearSelectedBlockImage={clearSelectedBlockImage}
          openBlockLink={openBlockLink}
        />
      </div>

      {quickMenu?.type === "canvas" && (
        <CanvasQuickMenu
          x={quickMenu.x}
          y={quickMenu.y}
          menuRef={quickMenuRef}
          point={quickMenu.point}
          addTextBlock={addTextBlock}
          addImageBlock={addImageBlock}
          addImageLinkBlock={addImageLinkBlock}
          showClickableImage={false}
          addBoxBlock={addBoxBlock}
          pasteCopiedBlockAt={pasteCopiedBlockAt}
          onClose={() => setQuickMenu(null)}
        />
      )}

      {quickMenu?.type === "block" && quickMenuBlock && (
        <BlockQuickMenu
          x={quickMenu.x}
          y={quickMenu.y}
          menuRef={quickMenuRef}
          block={quickMenuBlock}
          updateBlock={updateBlock}
          deleteBlock={deleteBlock}
          copyBlock={copyBlock}
          cutBlock={cutBlock}
          pasteCopiedBlockAt={pasteCopiedBlockAt}
          onClose={() => setQuickMenu(null)}
        />
      )}
    </div>
  );
}
