import { useState } from "react";
import { smallInputStyle } from "../../editorStyles";
import { Field } from "./Field";

export function BorderEditor({
  selected,
  onUpdate,
}: {
  selected: any;
  onUpdate: (patch: Record<string, any>) => void;
}) {
  const [linked, setLinked] = useState(true);

  const fallback = selected.borderWidth ?? 2;
  const top = selected.borderTopWidth ?? fallback;
  const right = selected.borderRightWidth ?? fallback;
  const bottom = selected.borderBottomWidth ?? fallback;
  const left = selected.borderLeftWidth ?? fallback;
  const color = selected.borderColor || "#ffffff";
  const style = selected.borderStyle || "solid";

  const allEqual = top === right && right === bottom && bottom === left;

  function setAllSides(val: number) {
    onUpdate({
      borderTopWidth: val,
      borderRightWidth: val,
      borderBottomWidth: val,
      borderLeftWidth: val,
    });
  }

  const numInput: React.CSSProperties = {
    ...smallInputStyle,
    width: 52,
    textAlign: "center",
    padding: "6px 4px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Couleur + Style */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <Field label="Couleur">
          <input
            type="color"
            value={color}
            onChange={(e) => onUpdate({ borderColor: e.target.value })}
          />
        </Field>
        <Field label="Style">
          <select
            value={style}
            onChange={(e) => onUpdate({ borderStyle: e.target.value })}
            style={smallInputStyle}
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
          </select>
        </Field>
      </div>

      {/* Épaisseur */}
      <div>
        {/* Header épaisseur + toggle lien */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            Épaisseur
          </span>
          <button
            onClick={() => {
              if (!linked && !allEqual) setAllSides(top);
              setLinked(!linked);
            }}
            title={linked ? "Déverrouiller les côtés" : "Lier tous les côtés"}
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              border: linked
                ? "1px solid rgba(129,140,248,0.4)"
                : "1px solid rgba(255,255,255,0.14)",
              background: linked ? "rgba(79,70,229,0.3)" : "rgba(30,30,55,0.85)",
              color: "#f5f5fb",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              padding: 0,
              lineHeight: 1,
              transition: "all 0.15s",
            }}
          >
            {linked ? "🔒" : "🔓"}
          </button>
          {!linked && (
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>côtés indépendants</span>
          )}
        </div>

        {linked ? (
          /* Mode lié : un seul champ */
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", minWidth: 72 }}>
              Tous les côtés
            </span>
            <input
              type="number"
              min="0"
              value={allEqual ? top : ""}
              placeholder={!allEqual ? "mixte" : undefined}
              onChange={(e) => setAllSides(Number(e.target.value) || 0)}
              style={numInput}
            />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>px</span>
          </div>
        ) : (
          /* Mode indépendant : layout en croix */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "68px 56px 68px",
              gridTemplateRows: "auto 40px auto",
              gap: "4px 6px",
              alignItems: "center",
              justifyItems: "center",
            }}
          >
            {/* Ligne 1 : vide | Top | vide */}
            <div />
            <Field label="Haut">
              <input
                type="number"
                min="0"
                value={top}
                onChange={(e) => onUpdate({ borderTopWidth: Number(e.target.value) || 0 })}
                style={numInput}
              />
            </Field>
            <div />

            {/* Ligne 2 : Gauche | preview | Droite */}
            <Field label="Gauche">
              <input
                type="number"
                min="0"
                value={left}
                onChange={(e) => onUpdate({ borderLeftWidth: Number(e.target.value) || 0 })}
                style={numInput}
              />
            </Field>

            {/* Mini-preview de la bordure */}
            <div
              style={{
                width: 44,
                height: 32,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 3,
                borderTop: `${Math.min(top, 10)}px ${style} ${color}`,
                borderRight: `${Math.min(right, 10)}px ${style} ${color}`,
                borderBottom: `${Math.min(bottom, 10)}px ${style} ${color}`,
                borderLeft: `${Math.min(left, 10)}px ${style} ${color}`,
              }}
            />

            <Field label="Droite">
              <input
                type="number"
                min="0"
                value={right}
                onChange={(e) => onUpdate({ borderRightWidth: Number(e.target.value) || 0 })}
                style={numInput}
              />
            </Field>

            {/* Ligne 3 : vide | Bottom | vide */}
            <div />
            <Field label="Bas">
              <input
                type="number"
                min="0"
                value={bottom}
                onChange={(e) => onUpdate({ borderBottomWidth: Number(e.target.value) || 0 })}
                style={numInput}
              />
            </Field>
            <div />
          </div>
        )}
      </div>
    </div>
  );
}
