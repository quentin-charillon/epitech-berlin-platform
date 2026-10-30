import { useState } from "react";

type Section =
  | "intro"
  | "video"
  | "toolbar"
  | "canvas"
  | "shortcuts"
  | "blocks"
  | "properties"
  | "multiselect"
  | "advanced";

const NAV: { id: Section; icon: string; label: string }[] = [
  { id: "intro", icon: "◎", label: "Introduction" },
  { id: "video", icon: "▶", label: "Video tutorial" },
  { id: "toolbar", icon: "⊞", label: "Toolbar" },
  { id: "canvas", icon: "▭", label: "Canvas & blocks" },
  { id: "shortcuts", icon: "⌨", label: "Keyboard shortcuts" },
  { id: "blocks", icon: "⬚", label: "Block types" },
  { id: "properties", icon: "≡", label: "Properties panel" },
  { id: "multiselect", icon: "⊟", label: "Multi-selection" },
  { id: "advanced", icon: "✦", label: "Advanced features" },
];

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: "var(--admin-surface-2)",
        border: "1px solid var(--admin-border)",
        borderRadius: 5,
        padding: "2px 8px",
        fontSize: 12,
        fontFamily: "monospace",
        color: "var(--admin-text)",
        margin: "0 2px",
      }}
    >
      {children}
    </span>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        display: "inline-block",
        background: "var(--admin-surface-2)",
        border: "1px solid var(--admin-border)",
        borderRadius: 4,
        padding: "2px 7px",
        fontSize: 12,
        fontFamily: "monospace",
        boxShadow: "0 1px 0 var(--admin-border)",
        color: "var(--admin-text)",
        margin: "0 2px",
      }}
    >
      {children}
    </kbd>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(167,139,250,0.08)",
        border: "1px solid rgba(167,139,250,0.25)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        color: "var(--admin-text)",
        margin: "10px 0",
      }}
    >
      <span style={{ color: "#a78bfa", fontWeight: 700, marginRight: 6 }}>💡 Tip:</span>
      {children}
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "rgba(251,191,36,0.08)",
        border: "1px solid rgba(251,191,36,0.25)",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        color: "var(--admin-text)",
        margin: "10px 0",
      }}
    >
      <span style={{ color: "#fbbf24", fontWeight: 700, marginRight: 6 }}>⚠ Warning:</span>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 20,
        fontWeight: 800,
        marginBottom: 18,
        marginTop: 0,
        paddingBottom: 12,
        borderBottom: "1px solid var(--admin-border)",
        color: "var(--admin-text)",
      }}
    >
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 15,
        fontWeight: 700,
        marginTop: 24,
        marginBottom: 10,
        color: "var(--admin-text)",
      }}
    >
      {children}
    </h3>
  );
}

function Row({ label, desc }: { label: React.ReactNode; desc: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: 12,
        padding: "8px 0",
        borderBottom: "1px solid var(--admin-border)",
        fontSize: 13,
        alignItems: "start",
      }}
    >
      <div style={{ fontWeight: 600, color: "var(--admin-text)" }}>{label}</div>
      <div style={{ color: "var(--admin-text-muted)", lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

// ─── Sections ────────────────────────────────────────────────────────────────

function SectionIntro() {
  return (
    <div>
      <SectionTitle>Introduction to the page editor</SectionTitle>
      <p
        style={{
          fontSize: 14,
          color: "var(--admin-text-muted)",
          lineHeight: 1.7,
          marginBottom: 20,
        }}
      >
        The page editor is a <strong>visual drag-and-drop</strong> tool that lets you build web
        pages without writing any code. Every element on the page (text, image, button…) is a{" "}
        <em>block</em> that you place freely on the canvas.
      </p>

      <div className="adminGrid adminGrid--3" style={{ marginBottom: 24 }}>
        <div className="adminCard" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⊞</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Toolbar</div>
          <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
            Add blocks from the top toolbar
          </div>
        </div>
        <div className="adminCard" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>▭</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Canvas</div>
          <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
            Drag, resize and arrange your blocks
          </div>
        </div>
        <div className="adminCard" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>≡</div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Properties panel</div>
          <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
            Customize the selected block on the right
          </div>
        </div>
      </div>

      <SubTitle>General interface</SubTitle>
      <Row
        label="Page title (H1)"
        desc="The main title displayed on the public page. Also used as the H1 tag for SEO."
      />
      <Row label="Navbar label" desc="The text that appears in the site's navigation menu." />
      <Row
        label="Show in nav"
        desc="Check this to make the page visible in the main navigation menu."
      />
      <Row
        label="Desktop / Tablet / Mobile"
        desc="Switches the canvas preview width (full screen / 768 px / 375 px). Useful to check the responsive layout."
      />
      <Row
        label="Preview button"
        desc="Opens the published page in a new tab to see the final result."
      />
      <Row
        label="Save button"
        desc="Saves all changes. An orange dot appears when there are unsaved changes."
      />
      <Row label="← Back" desc="Returns to the pages list (does not save automatically)." />

      <Tip>
        Save often with <Kbd>Ctrl</Kbd>+<Kbd>S</Kbd> or the <Tag>Save</Tag> button — there is no
        auto-save.
      </Tip>

      <SubTitle>Page background settings</SubTitle>
      <Row label="Color" desc="Solid background — pick a color with the color picker." />
      <Row
        label="Gradient"
        desc="Gradient background — set the start color, end color and angle."
      />
      <Row
        label="Image"
        desc="Import a background image (automatically compressed to 1920 px max)."
      />
      <Row
        label="Overlay"
        desc="Applies a semi-transparent color layer over the background. Useful to keep text readable over an image."
      />
      <Row label="Default font" desc="Sets the default font style used for new text blocks." />
    </div>
  );
}

function SectionVideo() {
  return (
    <div>
      <SectionTitle>Video tutorial</SectionTitle>
      <p
        style={{
          fontSize: 14,
          color: "var(--admin-text-muted)",
          lineHeight: 1.7,
          marginBottom: 20,
        }}
      >
        A full walkthrough of the page editor: adding blocks, using the properties panel, and
        publishing a page.
      </p>

      <video
        controls
        preload="metadata"
        src="/help/admin-tutorial.mp4"
        style={{
          width: "100%",
          maxWidth: 900,
          display: "block",
          borderRadius: 12,
          border: "1px solid var(--admin-border)",
          background: "#000",
        }}
      >
        Your browser does not support the video tag.
      </video>

      <Tip>
        Drop the video file at <Tag>front/public/help/admin-tutorial.mp4</Tag> — it will appear here
        automatically, no code change needed.
      </Tip>
    </div>
  );
}

function SectionToolbar() {
  return (
    <div>
      <SectionTitle>Toolbar — Creating blocks</SectionTitle>
      <p
        style={{
          fontSize: 14,
          color: "var(--admin-text-muted)",
          lineHeight: 1.7,
          marginBottom: 20,
        }}
      >
        The toolbar at the top of the editor contains all available block types. Click a button to
        activate creation mode, then click anywhere on the canvas to place the block at that
        position.
      </p>

      <SubTitle>Text content</SubTitle>
      <Row
        label={<Tag>Text</Tag>}
        desc="Creates a free text block. Double-click it on the canvas to edit inline. Supports multiple segments with independent styles (color, size, bold, italic, gradient)."
      />
      <Row
        label={<Tag>Box</Tag>}
        desc="Creates a colored rectangle. Can be used as a color background, a visual container, or a clickable link if a URL is added."
      />
      <Row
        label={<Tag>Link</Tag>}
        desc="Creates a styled hyperlink with a customizable label, URL and color."
      />

      <SubTitle>Media</SubTitle>
      <Row
        label={<Tag>Image</Tag>}
        desc="Opens the file picker to import an image. The image is automatically compressed (max 1400 px, 72% quality). Supports a color overlay."
      />
      <Row
        label={<Tag>Img Link</Tag>}
        desc="Same as Image but the image becomes clickable (link to a URL). Perfect for banners or visual CTAs."
      />
      <Row
        label={<Tag>Video</Tag>}
        desc="Imports a local video file (max 100 MB). The video is stored as base64 and plays directly in the page."
      />

      <SubTitle>Interactive elements</SubTitle>
      <Row
        label={<Tag>Emoji</Tag>}
        desc="Places an emoji on the canvas at large size. Adjustable size and rotation. Choose from 5 categories: Smileys, Nature, Objects, Symbols, Animals."
      />
      <Row
        label={<Tag>Button</Tag>}
        desc="Creates a clickable button with label, URL, background and text colors, padding and rounded corners."
      />
      <Row
        label={<Tag>Filter</Tag>}
        desc="Creates a category filter bar. Categories are detected automatically from the tags on other blocks. Visitors can click chips to filter visible blocks."
      />
      <Row
        label={<Tag>Countdown</Tag>}
        desc="Creates a countdown to a target date. Displays days, hours, minutes and seconds."
      />

      <SubTitle>Shapes</SubTitle>
      <p style={{ fontSize: 13, color: "var(--admin-text-muted)", marginBottom: 8 }}>
        The <Tag>Shapes</Tag> dropdown lets you choose from:
      </p>
      <Row
        label="Lines"
        desc="Line, Diagonal, Zigzag, Wave, Dashed — SVG separators or decorations."
      />
      <Row
        label="Geometric shapes"
        desc="Circle, Rectangle, Triangle, Diamond, Star, Arrow — solid shapes with configurable stroke and fill."
      />

      <SubTitle>Canvas options</SubTitle>
      <Row
        label="Snap to grid"
        desc="Enables magnetic alignment. When active, all movements snap to a grid (default 20 px). The grid size is shown in the toolbar when snap is on."
      />

      <Tip>
        After clicking a toolbar button (e.g. <Tag>Text</Tag>), the cursor changes to indicate
        creation mode. A second click on the canvas places the block. Press <Kbd>Esc</Kbd> to
        cancel.
      </Tip>
    </div>
  );
}

function SectionCanvas() {
  return (
    <div>
      <SectionTitle>Canvas — Manipulating blocks</SectionTitle>

      <SubTitle>Selection</SubTitle>
      <Row label="Left click" desc="Selects the block. The properties panel opens on the right." />
      <Row label="Shift + Click" desc="Adds or removes the block from the multi-selection." />
      <Row label="Click on empty canvas" desc="Deselects everything." />
      <Row
        label="Right-click on a block"
        desc="Opens the block context menu (copy, delete, Z-index, quick styles…)."
      />
      <Row
        label="Right-click on the canvas"
        desc="Opens the canvas context menu (add a block here or paste a copied block)."
      />

      <SubTitle>Moving</SubTitle>
      <Row
        label="Drag and drop"
        desc="Hold the left mouse button and drag the block to its new position."
      />
      <Row
        label="Multi-block drag"
        desc="When multiple blocks are selected, dragging one moves all selected blocks together."
      />
      <Row label="Arrow keys" desc="Moves the block 1 px in the chosen direction." />
      <Row label="Shift + Arrow keys" desc="Moves the block 10 px." />

      <SubTitle>Resizing</SubTitle>
      <Row
        label="Bottom-right corner handle"
        desc="Drag the handle (small square at the bottom right of the selected block) to resize."
      />
      <Row
        label="Shift + Resize (text)"
        desc="Increases the font size proportionally instead of changing the width."
      />

      <SubTitle>Rotating</SubTitle>
      <Row
        label="Rotation handle"
        desc="For shapes and emojis, a circle appears above the block. Drag it to rotate freely."
      />
      <Row label="Shift + Rotate" desc="Snaps rotation to 15° increments." />

      <SubTitle>Canvas context menu (right-click on empty canvas)</SubTitle>
      <Row
        label="Add a block here"
        desc="All block types are available. The block is created at the exact right-click position."
      />
      <Row
        label="Paste"
        desc="Pastes the copied block at the click position (offset by +24 px if pasted at the same spot)."
      />

      <SubTitle>Block context menu (right-click on a block)</SubTitle>
      <Row
        label="Copy / Cut / Paste / Duplicate"
        desc="Standard clipboard operations. Duplicate creates a copy offset by +24 px."
      />
      <Row label="Delete block" desc="Permanently removes the block (undoable with Ctrl+Z)." />
      <Row
        label="X / Y / Z position"
        desc="Number fields to precisely position the block and manage its stacking order."
      />
      <Row
        label="Forward / Backward / To front / To back"
        desc="Changes the Z-order (which block appears in front) of the selected block."
      />
      <Row
        label="Quick styles"
        desc="Depending on the block type: gradient, color, font size, dimensions, border radius, image overlay…"
      />

      <Tip>
        Double-click a text block to edit it directly on the canvas. Click outside to confirm.
      </Tip>

      <Warning>
        A <strong>locked</strong> block (option in the properties panel) cannot be dragged, but
        remains selectable for editing.
      </Warning>
    </div>
  );
}

function SectionShortcuts() {
  return (
    <div>
      <SectionTitle>Keyboard shortcuts</SectionTitle>

      <SubTitle>Navigation & selection</SubTitle>
      <Row
        label={
          <>
            <Kbd>Esc</Kbd>
          </>
        }
        desc="Deselects all blocks. Exits the back-face editing mode of a Flip Card."
      />
      <Row
        label={
          <>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <Kbd>←</Kbd>
            <Kbd>→</Kbd>
          </>
        }
        desc="Moves the selected block by 1 px."
      />
      <Row
        label={
          <>
            <Kbd>Shift</Kbd>+<Kbd>↑↓←→</Kbd>
          </>
        }
        desc="Moves the selected block by 10 px."
      />

      <SubTitle>Clipboard</SubTitle>
      <Row
        label={
          <>
            <Kbd>Ctrl</Kbd>+<Kbd>C</Kbd>
          </>
        }
        desc="Copies the selected block."
      />
      <Row
        label={
          <>
            <Kbd>Ctrl</Kbd>+<Kbd>X</Kbd>
          </>
        }
        desc="Cuts the selected block."
      />
      <Row
        label={
          <>
            <Kbd>Ctrl</Kbd>+<Kbd>V</Kbd>
          </>
        }
        desc="Pastes the copied block at the cursor position."
      />

      <SubTitle>History</SubTitle>
      <Row
        label={
          <>
            <Kbd>Ctrl</Kbd>+<Kbd>Z</Kbd>
          </>
        }
        desc="Undoes the last action."
      />
      <Row
        label={
          <>
            <Kbd>Ctrl</Kbd>+<Kbd>Y</Kbd> or <Kbd>Ctrl</Kbd>+<Kbd>Shift</Kbd>+<Kbd>Z</Kbd>
          </>
        }
        desc="Redoes the undone action."
      />

      <SubTitle>Deletion</SubTitle>
      <Row
        label={
          <>
            <Kbd>Del</Kbd> or <Kbd>⌫</Kbd>
          </>
        }
        desc="Deletes the selected block(s). Also works on multi-selection."
      />

      <Tip>
        Shortcuts <strong>do not work</strong> when a text field is active (to avoid interfering
        with typing). Click on the canvas first to re-enable them.
      </Tip>

      <SubTitle>Advanced text editing</SubTitle>
      <Row
        label="Select + Ctrl+C"
        desc="Select letters directly inside a text block on the canvas, then Ctrl+C copies the selection with its style. Ctrl+X cuts it."
      />
    </div>
  );
}

function SectionBlocks() {
  return (
    <div>
      <SectionTitle>Available block types</SectionTitle>

      <SubTitle>Text</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        The text block supports multiple <em>segments</em>: each part of the text can have its own
        color, size, style (normal, bold, italic) and even a color gradient. To edit the style of a
        specific selection, select the letters directly in the block on the canvas, then right-click
        to open the text formatting menu.
      </p>
      <Tip>
        In the properties panel, Size Y controls the font size and Size X (%) controls the
        horizontal stretch (from 100% to 500% for wide typographic effects).
      </Tip>

      <SubTitle>Box</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        A versatile rectangle: solid color, gradient or transparent background. Can have rounded
        corners, opacity, a border and a shadow. Can also serve as a clickable link by adding a URL.
      </p>

      <SubTitle>Image & Image Link</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        Import a local image (JPEG, PNG, WebP…). The image is automatically compressed.{" "}
        <em>Image Link</em> makes the image clickable to a URL. Both support a semi-transparent
        color overlay.
      </p>

      <SubTitle>Video</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        Block for embedding a local video (max 100 MB). The video plays directly on the page.
        Configurable dimensions and border radius.
      </p>

      <SubTitle>Button</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        Clickable button with label, URL, background color, text color, font size,
        horizontal/vertical padding and border radius. Option to open in a new tab.
      </p>

      <SubTitle>Link</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        Simple clickable text with label, URL and color. Lighter than a button.
      </p>

      <SubTitle>Emoji</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        Places an emoji at large scale. Choose from 5 categories (60 emojis) or paste any emoji.
        Adjustable size from 12 to 400 px. Free rotation.
      </p>

      <SubTitle>Shapes</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        SVG vector shapes: lines (Line, Diagonal, Zigzag, Wave, Dashed) and geometric shapes
        (Circle, Rectangle, Triangle, Diamond, Star, Arrow). Configurable stroke color and width,
        optional fill, opacity, rotation.
      </p>

      <SubTitle>Category filter</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        Displays a row of filter chips. Categories are auto-detected from the <em>Categories</em>{" "}
        fields of other blocks. When a visitor clicks a filter, only blocks with that category tag
        remain visible. All chip styles (active/inactive, border, font, size) are configurable.
      </p>

      <SubTitle>Countdown</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        Displays time remaining until a target date (days, hours, minutes, seconds). Customizable
        label, text and background colors, dimensions.
      </p>

      <SubTitle>Flip Card</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        A card with a front and a back face. To create a Flip Card: select one or more existing
        blocks, right-click, then <em>Create Flip Card</em>. The selected blocks become the front.
        Double-click the Flip Card to edit the back. Trigger: click or hover. Configurable animation
        duration.
      </p>

      <SubTitle>Group</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        Groups multiple blocks so they move together as a single unit. Create a group via the
        multi-selection bar or the context menu. Ungroup with the Ungroup button.
      </p>
    </div>
  );
}

function SectionProperties() {
  return (
    <div>
      <SectionTitle>Properties panel</SectionTitle>
      <p
        style={{
          fontSize: 14,
          color: "var(--admin-text-muted)",
          lineHeight: 1.7,
          marginBottom: 20,
        }}
      >
        The right panel appears as soon as a block is selected. Its content adapts to the block
        type.
      </p>

      <SubTitle>Position & layer (common to all blocks)</SubTitle>
      <Row label="X, Y" desc="Absolute position of the block on the canvas in pixels." />
      <Row label="Z index" desc="Stacking order. A higher Z appears in front of other blocks." />
      <Row
        label="Bring forward / Send backward"
        desc="Increments or decrements the Z index by 1."
      />
      <Row
        label="Bring to front / Send to back"
        desc="Puts the block in front of or behind everything in one action."
      />
      <Row label="Rotation (deg)" desc="Rotation angle of the block (−360° to 360°)." />
      <Row
        label="Lock (prevent drag)"
        desc="Prevents accidental dragging. The block remains selectable."
      />

      <SubTitle>Categories & Filters</SubTitle>
      <Row
        label="Categories"
        desc="Tags assigned to the block for the filter system. Press Enter or comma to add a tag, × to remove."
      />
      <Row
        label="Filter group"
        desc="Optional group name to animate the block during a filter change (translation instead of fade)."
      />

      <SubTitle>Hover effect</SubTitle>
      <Row label="Hover effect" desc="Enables a zoom effect when the block is hovered." />
      <Row label="Hover scale" desc="Zoom factor (1.1 = 10% larger). Min 1, max 3." />
      <Row label="Hover duration (s)" desc="Transition duration in seconds (default 0.25 s)." />

      <SubTitle>Shadow</SubTitle>
      <Row label="Shadow" desc="Enables/disables the drop shadow." />
      <Row
        label="X / Y / Blur"
        desc="Horizontal, vertical offset and blur of the shadow in pixels."
      />
      <Row
        label="Color & Opacity"
        desc="Shadow color and transparency (0 = invisible, 1 = opaque)."
      />

      <SubTitle>Border</SubTitle>
      <Row label="Border" desc="Enables/disables the block border." />
      <Row label="Style" desc="Solid, Dashed, Dotted, Double." />
      <Row
        label="Linked / unlinked thickness"
        desc="In linked mode, one value applies to all 4 sides. In unlinked mode, each side (Top, Right, Bottom, Left) is independent."
      />

      <SubTitle>Hover Reveal section (show/hide blocks)</SubTitle>
      <Row
        label="This block triggers the appearance"
        desc="When this block is hovered, target blocks with the same tag appear. Enter a group tag (e.g. card-1)."
      />
      <Row
        label="This block is hidden by default"
        desc="This block is invisible on load and appears when the trigger block with the same tag is hovered."
      />
      <Row
        label="This block is visible by default"
        desc="This block is visible but disappears when a trigger from the same category is hovered."
      />

      <Tip>
        To create a "hoverable card" effect without a Flip Card: place a visible image block, a
        hidden text block with the same tag, and set the image as the trigger. When the image is
        hovered, the text appears.
      </Tip>
    </div>
  );
}

function SectionMultiSelect() {
  return (
    <div>
      <SectionTitle>Multi-selection</SectionTitle>
      <p
        style={{
          fontSize: 14,
          color: "var(--admin-text-muted)",
          lineHeight: 1.7,
          marginBottom: 20,
        }}
      >
        Select multiple blocks by holding <Kbd>Shift</Kbd> and clicking each block. A control bar
        appears at the top of the canvas as soon as 2 or more blocks are selected.
      </p>

      <SubTitle>Alignment (2+ blocks)</SubTitle>
      <Row label="Align left ←" desc="Aligns the left edge of all blocks to the leftmost block." />
      <Row label="Center horizontally ↔" desc="Centers all blocks on the horizontal axis." />
      <Row
        label="Align right →"
        desc="Aligns the right edge of all blocks to the rightmost block."
      />
      <Row label="Align top ↑" desc="Aligns the top edge of all blocks to the highest block." />
      <Row label="Center vertically ↕" desc="Centers all blocks on the vertical axis." />
      <Row
        label="Align bottom ↓"
        desc="Aligns the bottom edge of all blocks to the lowest block."
      />

      <SubTitle>Distribution (3+ blocks)</SubTitle>
      <Row
        label="Distribute horizontally ⟺ H"
        desc="Spaces the blocks evenly on the horizontal axis."
      />
      <Row
        label="Distribute vertically ⟺ V"
        desc="Spaces the blocks evenly on the vertical axis."
      />

      <SubTitle>Grouping</SubTitle>
      <Row
        label="⊞ Group"
        desc="Creates a group with all selected blocks. The group can then be moved as a single entity."
      />
      <Row label="✕ Clear" desc="Deselects all blocks." />

      <Tip>
        <strong>Practical example:</strong> You have 4 cards arranged in a row and want them
        perfectly aligned at the top. Shift+Click the 4 cards → click <em>Align top ↑</em>. Then
        click <em>Distribute horizontally ⟺ H</em> to space them evenly.
      </Tip>
    </div>
  );
}

function SectionAdvanced() {
  return (
    <div>
      <SectionTitle>Advanced features</SectionTitle>

      <SubTitle>Block groups</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        A group encapsulates multiple blocks in a single container. The group has its own bounding
        box (12 px margin). Child blocks are positioned relative to the group. To ungroup: use the{" "}
        <Tag>Ungroup</Tag> button in the properties panel or context menu.
      </p>

      <SubTitle>Flip Cards</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        Flip Cards have two faces: <strong>Front</strong> (visible face) and <strong>Back</strong>{" "}
        (hidden face revealed by interaction).
      </p>
      <Row
        label="Create a Flip Card"
        desc="Select 1 or more blocks → right-click → Create Flip Card. The blocks become the front."
      />
      <Row
        label="Edit the back"
        desc="Double-click the Flip Card to enter back-face editing mode. A BACK badge appears. Add blocks (text, box, emoji, button, shape, image) via right-click."
      />
      <Row label="Exit back editing" desc="Click ← Front at the top left, or press Esc." />
      <Row label="Trigger" desc="Click or Hover — defines how the card flips." />
      <Row label="Animation duration" desc="Speed of the rotation (0.1 to 2 seconds)." />
      <Row
        label="Break apart"
        desc="Restores the front blocks to their original positions and removes the Flip Card container."
      />

      <SubTitle>Hover Reveal system</SubTitle>
      <p
        style={{
          fontSize: 13,
          color: "var(--admin-text-muted)",
          lineHeight: 1.6,
          marginBottom: 12,
        }}
      >
        This system lets you show/hide blocks based on hovering other blocks. Three roles are
        available (in each block's properties panel):
      </p>
      <Row
        label="Trigger"
        desc="This block triggers target blocks to appear. Assign a tag (e.g. info-card-1). On hover, all target blocks with that tag appear."
      />
      <Row
        label="Target (hidden by default)"
        desc="This block is invisible on load. It appears when the trigger block with the same tag is hovered."
      />
      <Row
        label="Visible by default (disappears on hover)"
        desc="This block is visible on load but disappears when a trigger from its category is hovered."
      />

      <Tip>
        <strong>Use case:</strong> On a product card, place a normal image (trigger tag:{" "}
        <em>product-1</em>) and a description text block (target, same tag). The description only
        appears when the user hovers over the image.
      </Tip>

      <SubTitle>Snap to grid</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        When enabled, all block movements and creations automatically snap to an invisible 20 px
        grid. Ideal for creating regular layouts. The grid size is shown in the toolbar when snap is
        active.
      </p>

      <SubTitle>Category filters — Setup</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        To use the filter system:
      </p>
      <ol
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.8, paddingLeft: 20 }}
      >
        <li>
          Assign <strong>Categories</strong> to your blocks in the properties panel (e.g.{" "}
          <em>Training</em>, <em>Event</em>, <em>Project</em>).
        </li>
        <li>
          Place a <Tag>Filter</Tag> block on the canvas. It auto-detects all categories.
        </li>
        <li>Customize the chip styles (active/inactive, colors, size, spacing).</li>
        <li>On the public site, visitors filter blocks by clicking the chips.</li>
      </ol>

      <SubTitle>History (Undo/Redo)</SubTitle>
      <p
        style={{ fontSize: 13, color: "var(--admin-text-muted)", lineHeight: 1.6, marginBottom: 8 }}
      >
        Every action (move, add, delete, style change…) creates a save point in the history. Use{" "}
        <Kbd>Ctrl</Kbd>+<Kbd>Z</Kbd> to go back and <Kbd>Ctrl</Kbd>+<Kbd>Y</Kbd> to redo. History is
        reset on every page load.
      </p>

      <SubTitle>Automatic media compression</SubTitle>
      <Row
        label="Images"
        desc="Resized to 1400 px max, 72% quality. Applied automatically on import."
      />
      <Row label="Background images (page)" desc="Resized to 1920 px max, 80% quality." />
      <Row label="Videos" desc="No compression — 100 MB limit. The video is stored as base64." />

      <Warning>
        Videos stored as base64 can significantly increase page data size. Prefer hosting videos on
        an external CDN and embedding them via URL when possible.
      </Warning>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminHelp() {
  const [active, setActive] = useState<Section>("intro");

  const sectionMap: Record<Section, React.ReactNode> = {
    intro: <SectionIntro />,
    video: <SectionVideo />,
    toolbar: <SectionToolbar />,
    canvas: <SectionCanvas />,
    shortcuts: <SectionShortcuts />,
    blocks: <SectionBlocks />,
    properties: <SectionProperties />,
    multiselect: <SectionMultiSelect />,
    advanced: <SectionAdvanced />,
  };

  return (
    <div>
      <div className="adminPageHeader">
        <div className="adminPageHeaderTitle">
          <span className="adminPageEyebrow">Documentation</span>
          <h1>Editor guide</h1>
          <p className="adminPageDescription">
            Everything you need to know to use the page editor.
          </p>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}
      >
        {/* Sidebar nav */}
        <div className="adminCard" style={{ padding: "8px 0", position: "sticky", top: 24 }}>
          {NAV.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "9px 16px",
                background: active === id ? "rgba(167,139,250,0.12)" : "transparent",
                border: "none",
                borderLeft: active === id ? "3px solid #a78bfa" : "3px solid transparent",
                borderRadius: 0,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active === id ? 700 : 400,
                color: active === id ? "#a78bfa" : "var(--admin-text)",
                textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: 15, width: 18, textAlign: "center", opacity: 0.7 }}>
                {icon}
              </span>
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="adminCard" style={{ minHeight: 400 }}>
          {sectionMap[active]}
        </div>
      </div>
    </div>
  );
}
