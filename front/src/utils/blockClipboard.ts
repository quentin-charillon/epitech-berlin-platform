function cloneValue(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function createId(prefix = "block") {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}

function getBlockPrefix(blockType) {
  switch (blockType) {
    case "text":
      return "txt";
    case "image":
      return "img";
    case "imageLink":
      return "imglink";
    case "box":
      return "box";
    case "link":
      return "link";
    case "filter":
      return "filter";
    default:
      return "block";
  }
}

function refreshNestedIds(block) {
  const nextBlock = {
    ...block,
    id: createId(getBlockPrefix(block?.type)),
  };

  if (Array.isArray(nextBlock.segments)) {
    nextBlock.segments = nextBlock.segments.map((segment) => ({
      ...segment,
      id: createId("seg"),
    }));
  }

  // group : régénère les IDs des blocs enfants
  if (Array.isArray(nextBlock.blocks)) {
    nextBlock.blocks = nextBlock.blocks.map((child) => refreshNestedIds(child));
  }

  // flipCard : régénère les IDs des blocs de la face avant
  if (Array.isArray(nextBlock.frontBlocks)) {
    nextBlock.frontBlocks = nextBlock.frontBlocks.map((child) => refreshNestedIds(child));
  }

  return nextBlock;
}

const clipboardState = {
  kind: null,
  block: null,
  text: null,
  pasteCount: 0,
};

export function writeBlockClipboard(block) {
  if (!block) return false;

  clipboardState.kind = "block";
  clipboardState.block = cloneValue(block);
  clipboardState.text = null;
  clipboardState.pasteCount = 0;
  return true;
}

export function hasBlockClipboard() {
  return clipboardState.kind === "block" && !!clipboardState.block;
}

export function writeTextClipboard(value) {
  const text =
    typeof value === "string" ? value : typeof value?.text === "string" ? value.text : "";

  if (!text) return false;

  clipboardState.kind = "text";
  clipboardState.text =
    typeof value === "string"
      ? { text }
      : {
          ...cloneValue(value),
          text,
        };
  clipboardState.block = null;
  clipboardState.pasteCount = 0;
  return true;
}

export function hasTextClipboard() {
  return clipboardState.kind === "text" && !!clipboardState.text?.text;
}

export function readTextClipboard() {
  if (clipboardState.kind !== "text" || !clipboardState.text?.text) {
    return null;
  }

  return cloneValue(clipboardState.text);
}

export function hasClipboardContent() {
  return hasBlockClipboard() || hasTextClipboard();
}

export function readPastedBlock({ offsetStep = 24 } = {}) {
  if (!hasBlockClipboard()) return null;

  clipboardState.pasteCount += 1;

  const offset = offsetStep * clipboardState.pasteCount;
  const clonedBlock = refreshNestedIds(cloneValue(clipboardState.block));

  return {
    ...clonedBlock,
    x: (clonedBlock.x ?? 0) + offset,
    y: (clonedBlock.y ?? 0) + offset,
  };
}
