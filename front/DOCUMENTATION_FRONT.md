# Documentation Technique — Frontend Epitech Berlin

> **Stack :** React 19 · TypeScript 6 · Tailwind CSS v4 · Vite 7 · React Router v7 · Axios  
> **Auteur :** Quentin Charillon  
> **Date :** 22 mai 2026

---

## Navigation rapide

| Section | Sujet |
|---|---|
| [1. Architecture générale](#1-architecture-générale) | Comment l'appli est organisée, le flux de données |
| [2. Structure des fichiers](#2-structure-des-fichiers) | Tous les fichiers et leur rôle |
| [3. Routing et navigation](#3-routing-et-navigation) | Routes, Navbar, hiérarchie |
| [4. Composants publics](#4-composants-publics) | CMSPage, SiteHeader, SiteFooter |
| [5. Le système de blocs](#5-le-système-de-blocs) | Concept, positionnement, rendu |
| [6. Chaque type de bloc](#6-chaque-type-de-bloc) | Les 15 types en détail |
| [7. Propriétés communes](#7-propriétés-communes-à-tous-les-blocs) | Ombre, bordure, animation, hover, reveal |
| [8. Compression des images](#8-compression-des-images) | Pipeline WebP, paramètres exacts |
| [9. L'éditeur de pages](#9-léditeur-de-pages) | Drag, resize, rotate, snap |
| [10. Les boutons de la toolbar](#10-les-boutons-de-la-toolbar) | Insertion de blocs, menus contextuels |
| [11. Le panneau de propriétés](#11-le-panneau-de-propriétés) | Chaque section du panneau |
| [12. Système de texte et segments](#12-système-de-texte-et-segments) | Segments, parsing DOM, application de style |
| [13. Undo / Redo](#13-undo--redo) | Snapshots, historique, restore |
| [14. Copy / Paste](#14-copy--paste) | Clipboard, IDs, décalage |
| [15. Système de filtrage](#15-système-de-filtrage) | Filter block, reflow algorithm |
| [16. Système Reveal](#16-système-reveal) | Affichage conditionnel au survol |
| [17. Animations d'entrée](#17-animations-dentrée) | fadeIn, slideUp, zoomIn, Intersection Observer |
| [18. Ombres et bordures](#18-ombres-et-bordures) | box-shadow inset, per-side borders |
| [19. Header et Footer](#19-header-et-footer) | Éditeurs visuels, API spéciale |
| [20. Administration](#20-administration) | Pages, users, dashboard, backup |
| [21. Authentification JWT](#21-authentification-jwt) | Login, token, route guard |
| [22. Communication API](#22-communication-api) | Endpoints, fonctions, auth headers |
| [23. Styles et theming](#23-styles-et-theming) | Tailwind v4, admin.css, variables |
| [24. Événements fenêtre](#24-événements-fenêtre) | Mise à jour en temps réel |
| [25. Utilitaires](#25-utilitaires) | uid, clamp, gradients, helpers |

---

## 1. Architecture générale

L'application est un **CMS no-code** : les admins construisent des pages visuellement, les visiteurs voient le résultat.

### Vue d'ensemble du flux

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN                                                  │
│  /admin/pages/:slug → éditeur drag & drop               │
│      ↓ PUT /api/pages/:slug (JSON avec blocks[])        │
│  MongoDB                                                │
│      ↓ GET /api/pages/:slug                             │
│  VISITEUR                                               │
│  /* → CMSPage → PageBlocksRenderer → HTML/CSS inline    │
└─────────────────────────────────────────────────────────┘
```

### Les deux zones principales

| Zone | URL | Composant principal |
|---|---|---|
| **Site public** | `/`, `/*` | `CMSPage.tsx` → `PageBlocksRenderer.tsx` |
| **Back-office** | `/admin/*` | `AdminLayout.tsx` + pages admin |

### Variables d'environnement

```env
VITE_API_URL=http://localhost:3001   # URL de l'API backend (fallback par défaut)
```

---

## 2. Structure des fichiers

```
front/
├── src/
│   ├── main.tsx                         ← Point d'entrée React (StrictMode)
│   ├── App.tsx                          ← Toutes les routes + layout global
│   ├── App.css                          ← (vide)
│   ├── index.css                        ← Tailwind + thème sombre global
│   │
│   ├── components/                      ← Composants du site public
│   │   ├── Navbar.tsx                   ← Barre de nav avec dropdown hiérarchiques
│   │   ├── SiteHeader.tsx               ← Bannière globale avec blocs positionnés
│   │   ├── SiteFooter.tsx               ← Footer global (même structure que header)
│   │   └── PageBlocksRenderer.tsx       ← Moteur de rendu des blocs (1955 lignes)
│   │
│   ├── pages/
│   │   └── CMSPage.tsx                  ← Charge la page par slug et la rend
│   │
│   ├── utils/                           ← Logique pure, sans JSX
│   │   ├── gradients.ts                 ← Génération de strings CSS gradient
│   │   ├── textSegments.ts              ← Système de segments de texte (448 lignes)
│   │   ├── blockClipboard.ts            ← Copy/paste de blocs
│   │   └── historyState.ts              ← Undo/redo
│   │
│   └── admin/                           ← Tout le back-office
│       ├── admin.css                    ← Design system admin (variables CSS)
│       ├── ProtectedRoute.tsx           ← Guard JWT (vérifie token + rôle)
│       ├── AdminLogin.tsx               ← Page login / register
│       ├── AdminLayout.tsx              ← Sidebar 260px + zone principale
│       ├── AdminDashboard.tsx           ← Tableau de bord + backup/restore
│       ├── AdminPagesList.tsx           ← Liste et gestion des pages
│       ├── AdminPageEditor.tsx          ← Éditeur de page (~2000 lignes)
│       ├── AdminSiteSettings.tsx        ← Éditeur visuel du header
│       ├── AdminFooterEditor.tsx        ← Éditeur visuel du footer
│       ├── AdminUsers.tsx               ← Gestion des utilisateurs
│       ├── AdminHelp.tsx                ← Documentation intégrée
│       ├── mockData.ts                  ← Toutes les fonctions d'appel API
│       │
│       ├── Page editor/                 ← Module de l'éditeur
│       │   ├── editorLogic.tsx          ← Hook principal : état + toutes les actions
│       │   ├── editorStyles.ts          ← Constantes de styles CSS-in-JS
│       │   ├── editorMathCalcul.ts      ← uid(), clamp(), getCanvasPoint(), etc.
│       │   │
│       │   ├── utils/
│       │   │   ├── imageUtils.ts        ← compressImage() (FileReader + Canvas + WebP)
│       │   │   └── textBlockUtils.ts    ← Helpers pour les blocs texte
│       │   │
│       │   ├── components/
│       │   │   ├── Toolbar.tsx          ← Barre d'outils (boutons d'insertion)
│       │   │   ├── PageSettingsPanel.tsx ← Réglages fond de page
│       │   │   ├── PropertiesPanel.tsx  ← Panneau latéral de propriétés du bloc
│       │   │   ├── MultiSelectionBar.tsx ← Barre multi-sélection
│       │   │   ├── EditorErrorBoundary.tsx ← Catch d'erreurs React
│       │   │   │
│       │   │   ├── canvas/
│       │   │   │   ├── CanvasBlock.tsx  ← Rendu d'un bloc en mode édition
│       │   │   │   ├── TextBlock.tsx    ← Bloc texte avec contenteditable
│       │   │   │   └── ShapeBlockSvg.tsx ← SVG des 11 formes
│       │   │   │
│       │   │   ├── menus/
│       │   │   │   ├── QuickMenu.tsx
│       │   │   │   ├── BlockContextMenu.tsx     ← Clic droit sur un bloc
│       │   │   │   ├── CanvasContextMenu.tsx    ← Clic droit sur le canvas
│       │   │   │   ├── FlipBackContextMenu.tsx  ← Menu face arrière flip card
│       │   │   │   └── TextSelectionContextMenu.tsx ← Menu sélection texte
│       │   │   │
│       │   │   └── shared/
│       │   │       ├── Field.tsx         ← Label wrapper
│       │   │       ├── ColorInput.tsx    ← Sélecteur couleur HTML5 + hex
│       │   │       ├── GradientPicker.tsx ← Double colorpicker + angle
│       │   │       ├── BorderEditor.tsx  ← Épaisseur par côté + style + couleur
│       │   │       ├── ResizeHandle.tsx  ← Poignée bas-droite
│       │   │       └── RotateHandle.tsx  ← Poignée haut-droite
│       │   │
│       │   └── hooks/
│       │       ├── useEditorLogic.ts    ← Re-export du hook principal
│       │       ├── useTextEditing.ts    ← État et parsing du texte éditable
│       │       ├── useImageUpload.ts    ← Upload + compression images/vidéo
│       │       ├── useQuickMenu.ts      ← Position et état des menus contextuels
│       │       └── useToast.ts          ← Notifications temporaires
│       │
│       └── siteSettings/               ← Module éditeur header/footer
│           ├── utils.ts                ← Helpers (normalisation, compression)
│           ├── HeaderPreview.tsx        ← Canvas interactif du header
│           ├── HeaderSettingsPanel.tsx  ← Réglages fond, hauteur, overlay
│           ├── FooterPreview.tsx
│           ├── FooterSettingsPanel.tsx
│           ├── SelectedBlockPanel.tsx   ← Propriétés du bloc sélectionné
│           └── QuickMenus.tsx           ← Menus contextuels du header/footer
│
├── public/                             ← Assets statiques
├── index.html                          ← Shell HTML
├── vite.config.js                      ← Config Vite + Tailwind plugin
├── tsconfig.json
└── package.json
```

---

## 3. Routing et navigation

### Toutes les routes (`App.tsx`)

```
Route publique :
  /                 → CMSPage (slug = "home")
  /home             → CMSPage (slug = "home")
  /*                → CMSPage (slug = dernier segment de l'URL)

Routes admin (toutes derrière <ProtectedRoute>) :
  /admin/login      → AdminLogin (non protégée)
  /admin            → AdminDashboard
  /admin/pages      → AdminPagesList
  /admin/pages/*    → AdminPageEditor
  /admin/footer     → AdminFooterEditor
  /admin/site-settings → AdminSiteSettings
  /admin/users      → AdminUsers
  /admin/help       → AdminHelp
```

### Layout global (`AppLayout`)

Le composant `AppLayout` enveloppe toutes les routes. Il :

1. Rend toujours `<Navbar />`
2. Rend `<Outlet />` (le contenu de la route)
3. Rend `<SiteFooter />` **sauf** sur les routes `/admin/*` (détecté via `useLocation`)
4. Écoute `window.addEventListener("pages:changed", ...)` et `"site:changed"` pour déclencher un re-render de la nav et du header

### Navbar (`Navbar.tsx`)

**Chargement :**  
Au montage, `loadPages()` est appelé et retourne la liste complète des pages. La navbar filtre les slugs `home` et `__footer__` (jamais affichés). Les pages sont triées par `navOrder`.

**Hiérarchie parent/enfant :**  
Les pages ayant un `parentSlug` non null sont des sous-pages. La navbar construit un objet comme :

```typescript
{
  parentPage: { slug, navLabel, navOrder },
  children: [{ slug, navLabel }, ...]
}
```

Les sous-pages s'affichent en **dropdown** : `onMouseEnter` sur le parent déclenche l'affichage après 100 ms de délai (via `setTimeout`), `onMouseLeave` le ferme.

**Mise à jour en temps réel :**  
Un `useEffect` ajoute un listener `pages:changed` sur `window`. Quand l'admin sauvegarde une page, cet événement est dispatché et la navbar recharge ses données sans rafraîchir la page.

---

## 4. Composants publics

### `CMSPage.tsx`

Composant minimaliste (43 lignes). Rôle unique : lire le slug de l'URL et rendre la page correspondante.

```typescript
// Lit le slug depuis l'URL
const { "*": rawSlug } = useParams();
const slug = rawSlug || "home";

// Si le slug est __footer__, redirige vers home
if (slug === "__footer__") return <Navigate to="/home" />;

// Sinon, charge la page et la rend
const page = await getPage(slug);
return <PageCanvas page={page} />;
```

### `SiteHeader.tsx`

La bannière globale est une **page spéciale** chargée depuis `GET /api/site-settings`. Elle ne fait pas partie des pages CMS normales.

**Types de fond supportés :**
- `color` : couleur unie
- `image` : image avec overlay coloré semi-transparent

**Positionnement du fond :**  
`backgroundPositionX` et `backgroundPositionY` sont en pourcentage (0–100). Traduits en CSS : `background-position: {X}% {Y}%`.

**Les blocs :**  
Identiques au système de blocs CMS (position absolue), mais seuls 4 types sont supportés dans le header : `text`, `image`, `box`, `link`.

**Lien vers home :**  
Le premier bloc de type `image` trouvé dans la liste est automatiquement enveloppé dans un `<a href="/home">`, pour permettre de cliquer sur le logo.

### `SiteFooter.tsx`

Architecture identique au header, mais chargée depuis `GET /api/pages/__footer__`. Le slug `__footer__` est une convention interne qui désigne la page dédiée au footer.

---

## 5. Le système de blocs

### Concept de base

Chaque page contient un tableau `blocks: Block[]`. Chaque bloc est un **objet JSON** avec une position absolue, des dimensions, et des propriétés spécifiques à son type.

**Le rendu se fait dans `PageBlocksRenderer.tsx`** : ce fichier de 1955 lignes itère sur la liste des blocs et génère le HTML/CSS correspondant pour chaque bloc.

### Positionnement absolu

Tous les blocs sont rendus dans un conteneur `position: relative`. Chaque bloc est `position: absolute` :

```css
/* Style appliqué à chaque bloc */
position: absolute;
left: {block.x}px;
top: {block.y}px;
width: {block.w}px;    /* si défini */
height: {block.h}px;   /* si défini */
z-index: {block.zIndex};
transform: rotate({block.rotation}deg);
```

Pour les blocs sans `h` défini (texte, lien, emoji), la hauteur est automatique (déterminée par le contenu).

### Hauteur du canvas

La hauteur du canvas n'est pas fixe. Elle est calculée dynamiquement dans `calculateCanvasHeight()` :

```typescript
// editorMathCalcul.ts
export function calculateCanvasHeight(blocks, minHeight, padding = 400) {
  let maxY = 0;
  for (const b of blocks) {
    if (b.type === "text")  maxY = Math.max(maxY, b.y + 140);
    if (b.type === "link")  maxY = Math.max(maxY, b.y + 120);
    if (b.type === "box" || b.type === "image")
      maxY = Math.max(maxY, b.y + (b.h ?? 0) + 140);
  }
  return Math.max(minHeight, maxY + padding);
}
```

Le canvas a donc toujours au moins `minHeight` pixels, et s'étend automatiquement si des blocs descendent plus bas.

### Génération des IDs de blocs

```typescript
// editorMathCalcul.ts
export function uid() {
  return "b_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

// blockClipboard.ts — avec préfixe selon le type
function createId(prefix = "block") {
  return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
}
// → "txt_3a9f...", "img_7b2c...", "box_1d4e..."
```

---

## 6. Chaque type de bloc

### `text` — Bloc de texte

**Rendu :** `<div>` en `white-space: pre-wrap` contenant des `<span>` pour chaque segment.

```html
<!-- Exemple de HTML généré -->
<div style="position:absolute; left:120px; top:80px;">
  <span data-seg-id="seg_abc" style="font-size:32px; color:#ffffff; font-weight:400;">
    Bienvenue à 
  </span>
  <span data-seg-id="seg_def" style="font-size:32px; background-image:linear-gradient(135deg,#7c3aed,#f59e0b); -webkit-background-clip:text; color:transparent;">
    Epitech Berlin
  </span>
</div>
```

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `text` | `string` | Contenu brut (concaténation des segments) |
| `fontSize` | `number` | Taille de base en px (héritée par les segments sans fontSize propre) |
| `color` | `string` | Couleur hex du premier segment |
| `fontStyle` | `string` | `normal \| italic \| bold \| bolditalic` |
| `segments` | `TextSegment[]` | Liste des segments (voir section 12) |
| `fillType` | `string` | `color \| gradient` |
| `gradientStart`, `gradientEnd` | `string` | Couleurs du dégradé global |
| `gradientAngle` | `number` | Angle du dégradé en degrés |
| `scaleX` | `number` | Compression/étirement horizontal (`transform: scaleX()`) |

---

### `image` — Bloc image

**Rendu :** `<img>` avec `object-fit: cover`.

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `src` | `string` | Data URL base64 (image compressée WebP) |
| `w`, `h` | `number` | Dimensions en px |
| `borderRadius` | `number` | Arrondi en px |
| `overlayEnabled` | `boolean` | Active un `<div>` overlay par-dessus l'image |
| `overlayColor` | `string` | Couleur hex de l'overlay |
| `overlayOpacity` | `number` | Opacité 0–1 |

**Structure HTML générée :**
```html
<div style="position:relative; width:400px; height:300px; border-radius:8px; overflow:hidden;">
  <img src="data:image/webp;base64,..." style="width:100%; height:100%; object-fit:cover;" />
  <!-- Si overlayEnabled : -->
  <div style="position:absolute; inset:0; background:rgba(r,g,b,0.4);"></div>
</div>
```

---

### `imageLink` — Bloc image cliquable

Identique à `image` mais enveloppé dans `<a href>`. Propriété supplémentaire :

| Propriété | Type | Description |
|---|---|---|
| `url` | `string` | URL de destination |
| `newTab` | `boolean` | `target="_blank"` si vrai |

**Normalisation des URLs :**  
Si l'URL commence par `/` ou ne contient pas `://`, c'est un lien interne (pas de `target="_blank"` forcé). Si elle commence par `http://`, `https://`, `mailto:` ou `tel:`, c'est externe.

---

### `box` — Bloc rectangulaire

**Rendu :** `<div>` coloré ou avec dégradé. Peut être cliquable.

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `w`, `h` | `number` | Dimensions |
| `color` | `string` | Couleur de fond (si `fillType: "color"`) |
| `fillType` | `string` | `color \| gradient` |
| `gradientStart`, `gradientEnd`, `gradientAngle` | - | Paramètres du dégradé |
| `borderRadius` | `number` | Arrondi en px |
| `opacity` | `number` | Opacité globale du bloc (0–1) |
| `linkUrl` | `string` | Rend le bloc cliquable |
| `newTab` | `boolean` | Ouvre dans un nouvel onglet |

---

### `button` — Bouton CTA

**Rendu :** `<a>` stylisé. Toujours un lien, jamais un `<button>` HTML.

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `label` | `string` | Texte du bouton |
| `url` | `string` | URL de destination |
| `bgColor` | `string` | Couleur de fond du bouton |
| `textColor` | `string` | Couleur du texte |
| `fontSize` | `number` | Taille en px |
| `fontStyle` | `string` | `normal \| bold \| italic \| bolditalic` |
| `paddingX` | `number` | Padding horizontal en px |
| `paddingY` | `number` | Padding vertical en px |
| `borderRadius` | `number` | Arrondi en px |
| `newTab` | `boolean` | `target="_blank"` |

---

### `video` — Bloc vidéo

**Rendu :** `<video controls>` HTML5 natif. Pas de librairie externe.

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `src` | `string` | Data URL base64 de la vidéo |
| `w`, `h` | `number` | Dimensions |
| `borderRadius` | `number` | Arrondi |

**Limite :** les vidéos sont limitées à **100 Mo** lors de l'upload (vérification dans `useImageUpload.ts`). Elles ne sont pas compressées (contrairement aux images), juste lues en base64 avec `FileReader`.

---

### `divider` — Séparateur

**Rendu :** `<div>` avec une bordure.

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `w` | `number` | Largeur |
| `thickness` | `number` | Épaisseur en px |
| `color` | `string` | Couleur hex |
| `opacity` | `number` | Opacité 0–1 |
| `lineStyle` | `string` | `solid \| dashed` |

---

### `gallery` — Galerie d'images

**Rendu :** `display: grid` avec N colonnes.

```css
display: grid;
grid-template-columns: repeat({columns}, 1fr);
gap: {gap}px;
```

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `images` | `{ id: string, src: string }[]` | Liste des images |
| `columns` | `number` | Nombre de colonnes (défaut : 3) |
| `gap` | `number` | Espacement entre images (défaut : 8px) |
| `w`, `h` | `number` | Dimensions du conteneur |
| `borderRadius` | `number` | Arrondi de chaque image |

Chaque image dans la galerie est compressée individuellement lors de l'upload (même pipeline que les images classiques, voir section 8). Les uploads sont faits en parallèle avec `Promise.all()`.

---

### `countdown` — Compte à rebours

**Rendu :** affichage `JJ : HH : MM : SS` mis à jour chaque seconde via `setInterval`.

**Calcul du temps restant :**
```typescript
const diff = new Date(targetDate).getTime() - Date.now();
const days = Math.floor(diff / (1000 * 60 * 60 * 24));
const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
const seconds = Math.floor((diff % (1000 * 60)) / 1000);
```

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `targetDate` | `string` | Date ISO cible |
| `label` | `string` | Libellé sous le timer |
| `fontSize` | `number` | Taille en px (défaut : 32) |
| `textColor` | `string` | Couleur du texte |
| `bgColor` | `string` | Couleur de fond |
| `w`, `h`, `borderRadius` | `number` | Dimensions |

**Défaut targetDate :** si non défini, positionné à J+30 depuis la création.

---

### `quote` — Citation / Témoignage

**Rendu :** carte avec un trait coloré à gauche (accent), texte de citation en italique, nom et rôle de l'auteur en dessous.

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `text` | `string` | Contenu de la citation |
| `author` | `string` | Nom de l'auteur |
| `role` | `string` | Rôle / titre |
| `textColor` | `string` | Couleur du texte de citation |
| `authorColor` | `string` | Couleur du nom auteur (défaut : gris clair) |
| `accentColor` | `string` | Couleur du trait gauche (défaut : `#4f46e5`) |
| `bgColor` | `string` | Fond de la carte (défaut : `rgba(255,255,255,0.05)`) |
| `fontSize` | `number` | Taille |

---

### `link` — Lien texte

**Rendu :** `<a>` stylisé avec `cursor: pointer`.

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `label` | `string` | Texte affiché |
| `url` | `string` | Destination |
| `color` | `string` | Couleur hex |
| `fontSize` | `number` | Taille en px |
| `fontStyle` | `string` | Style |
| `underline` | `boolean` | `text-decoration: underline` |

---

### `emoji` — Emoji seul

**Rendu :** `<span>` avec un seul emoji en grande taille. Simple mais utile pour décorer.

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `emoji` | `string` | Caractère emoji (défaut : `✨`) |
| `fontSize` | `number` | Taille en px (défaut : 64) |
| `rotation` | `number` | Rotation en degrés (héritée des propriétés communes) |

---

### `shape` — Forme SVG

**Rendu :** `<svg>` avec viewBox adapté à la forme.

**11 formes disponibles :**

| Nom | Description |
|---|---|
| `circle` | Cercle |
| `rect` | Rectangle |
| `triangle` | Triangle équilatéral (polygon SVG) |
| `diamond` | Losange |
| `star` | Étoile 5 branches |
| `arrow` | Flèche directionnelle |
| `line` | Ligne horizontale |
| `diagonal` | Ligne diagonale |
| `zigzag` | Ligne en zigzag (polyline) |
| `wave` | Courbe sinusoïdale (path SVG) |
| `dashed` | Ligne pointillée |

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `shapeType` | `string` | Un des 11 types ci-dessus |
| `w`, `h` | `number` | Dimensions du SVG |
| `fillEnabled` | `boolean` | Active le remplissage |
| `fillColor` | `string` | Couleur de remplissage (défaut : `#4f46e5`) |
| `strokeColor` | `string` | Couleur du contour (défaut : `#ffffff`) |
| `strokeWidth` | `number` | Épaisseur du contour (défaut : 3) |
| `linkUrl`, `newTab` | - | Rend la forme cliquable |

**Défaut `fillEnabled` :** `false` pour les formes de type ligne (`line`, `diagonal`, `zigzag`, `wave`, `dashed`), `true` pour les autres.

---

### `group` — Groupe de blocs

**Rendu :** `<div>` en `position: relative` avec `overflow: hidden`. Les blocs enfants sont positionnés **relativement au groupe**, pas au canvas.

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `blocks` | `Block[]` | Tableau de blocs enfants (même structure que blocs normaux) |
| `w`, `h` | `number` | Dimensions du groupe |
| `borderRadius` | `number` | Arrondi |

**Imbrication :** les blocs enfants d'un groupe supportent eux-mêmes toutes les propriétés communes (ombre, bordure, animation, hover). Les animations des blocs enfants fonctionnent indépendamment.

---

### `flipCard` — Carte retournable

**Rendu :** animation CSS 3D. Deux faces (`frontBlocks` et `backBlocks`), chacune pouvant contenir ses propres blocs.

**CSS 3D utilisé :**
```css
.flipCardContainer {
  perspective: 1200px;
}
.flipCardInner {
  transform-style: preserve-3d;
  transition: transform {flipDuration}s ease;
}
/* Au repos : */
.front { transform: rotateY(0deg);   backface-visibility: hidden; }
.back  { transform: rotateY(180deg); backface-visibility: hidden; }
/* Retourné : */
.flipCardInner.flipped { transform: rotateY(180deg); }
```

**Propriétés spécifiques :**

| Propriété | Type | Description |
|---|---|---|
| `flipTrigger` | `string` | `click \| hover` |
| `flipDuration` | `number` | Durée en secondes (défaut : 0.6) |
| `frontBlocks` | `Block[]` | Blocs sur la face avant |
| `backBlocks` | `Block[]` | Blocs sur la face arrière |
| `frontBgColor`, `backBgColor` | `string` | Fonds des faces |
| `frontBorderEnabled`, `backBorderEnabled` | `boolean` | Bordures indépendantes par face |
| `w`, `h`, `borderRadius` | `number` | Dimensions |

---

### `filter` — Système de filtrage

**Rendu :** boutons (chips) qui filtrent les autres blocs du canvas selon leurs tags.

**Fonctionnement complet :**

1. Des blocs normaux (box, image, text…) ont une propriété `filterTags: string[]` (ex: `["étudiants", "events"]`)
2. Le bloc `filter` scanne automatiquement tous les blocs de la page ayant des `filterTags` et génère les boutons
3. Un clic sur un chip active ce filtre
4. Seuls les blocs ayant ce tag dans leur `filterTags` restent visibles
5. Les blocs filtrés se repositionnent grâce à `computeLayoutAdjustments()` (voir section 15)

**Propriétés des chips :**

| Propriété | Type | Défaut |
|---|---|---|
| `chipActiveBg` | `string` | `#ffffff` |
| `chipActiveColor` | `string` | `#0a0a0a` |
| `chipInactiveBg` | `string` | `rgba(255,255,255,0.06)` |
| `chipInactiveColor` | `string` | `rgba(255,255,255,0.7)` |
| `chipBorderRadius` | `number` | `999` (pilule) |
| `chipFontSize` | `number` | `13` |
| `chipPaddingX`, `chipPaddingY` | `number` | `14`, `7` |
| `chipGap` | `number` | `8` |
| `showCount` | `boolean` | `true` (affiche le nombre de résultats) |
| `containerBg` | `string` | `transparent` |
| `containerPadding` | `number` | `0` |

---

## 7. Propriétés communes à tous les blocs

Ces propriétés sont présentes sur **chaque** bloc, quel que soit son type. Elles sont appliquées dans `withHoverDefaults()` dans `editorLogic.tsx` lors de la création ou du chargement d'un bloc.

### Position et géométrie

| Propriété | Type | Défaut | Description |
|---|---|---|---|
| `id` | `string` | généré | Identifiant unique |
| `x`, `y` | `number` | `0` | Position absolue (px) |
| `zIndex` | `number` | `1` | Couche d'affichage |
| `rotation` | `number` | `0` | Rotation CSS en degrés |
| `locked` | `boolean` | `false` | Interdit le drag/resize dans l'éditeur |

### Hover

Quand `hoverEnabled` est `true`, au survol le bloc scale via une `transition` CSS.

```typescript
// withHoverDefaults() — valeurs par défaut
hoverEnabled: false,
hoverScale: 1.1,       // 110% de la taille
hoverDuration: 0.25,   // 250ms
```

```css
/* CSS appliqué */
transition: transform {hoverDuration}s ease;
transform: rotate({rotation}deg) scale({hoverScale}); /* quand survolé */
transform: rotate({rotation}deg) scale(1);            /* au repos */
```

Note : le scale est **composé** avec la rotation pour ne pas l'annuler.

### Ombre portée

```typescript
shadowEnabled: false,
shadowX: 4,
shadowY: 4,
shadowBlur: 12,
shadowColor: "#000000",
shadowOpacity: 0.4,
```

**Génération dans `getBlockBoxShadow()` (`PageBlocksRenderer.tsx:11`) :**
```typescript
export function getBlockBoxShadow(block) {
  if (!block?.shadowEnabled) return undefined;
  const hex = block.shadowColor || "#000000";
  const r = parseInt(hex.slice(1, 3), 16);  // conversion hex → décimal
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = block.shadowOpacity ?? 0.4;
  return `${block.shadowX}px ${block.shadowY}px ${block.shadowBlur}px rgba(${r},${g},${b},${a})`;
}
// → "4px 4px 12px rgba(0,0,0,0.4)"
```

### Bordure

```typescript
borderEnabled: false,
borderWidth: 2,
borderColor: "#ffffff",
borderStyle: "solid",
// Épaisseurs par côté (héritent de borderWidth si non définis) :
borderTopWidth, borderRightWidth, borderBottomWidth, borderLeftWidth
```

**Génération dans `getBlockBorder()` (`PageBlocksRenderer.tsx:21`) :**

Les bordures `solid` sont simulées via `box-shadow inset` (et non `border` CSS) pour pouvoir se combiner avec d'autres `box-shadow` (comme l'ombre portée) :

```typescript
export function getBlockBorder(block, existingBoxShadow?) {
  if (block.borderStyle === "solid") {
    // Inset shadows simulent chaque côté
    const inset = [
      top    > 0 && `inset 0 ${top}px 0 0 ${c}`,      // top
      right  > 0 && `inset -${right}px 0 0 0 ${c}`,   // right
      bottom > 0 && `inset 0 -${bottom}px 0 0 ${c}`,  // bottom
      left   > 0 && `inset ${left}px 0 0 0 ${c}`,     // left
    ].filter(Boolean).join(", ");
    // Combine avec l'ombre portée si présente
    return { boxShadow: [inset, existingBoxShadow].filter(Boolean).join(", ") };
  }
  // Pour "dashed" : propriétés border CSS classiques
  return {
    borderTop: `${top}px ${s} ${c}`,
    borderRight: `${right}px ${s} ${c}`,
    borderBottom: `${bottom}px ${s} ${c}`,
    borderLeft: `${left}px ${s} ${c}`,
  };
}
```

### Tags de filtrage

```typescript
filterTags: string[]  // ex: ["étudiants", "paris"]
```

Utilisé par le bloc `filter` pour catégoriser et afficher/masquer des blocs.

---

## 8. Compression des images

Fichier : [src/admin/Page editor/utils/imageUtils.ts](src/admin/Page%20editor/utils/imageUtils.ts)

### Fonction `compressImage`

```typescript
export function compressImage(file: File, maxWidth = 1400, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        // Calcule le ratio pour ne pas dépasser maxWidth
        const ratio = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convertit en WebP avec la qualité donnée
        resolve(canvas.toDataURL("image/webp", quality));
      };

      img.src = String(reader.result || "");
    };

    reader.readAsDataURL(file);
  });
}
```

### Pipeline détaillé

```
Fichier sélectionné par l'utilisateur
        ↓
FileReader.readAsDataURL(file)
        ↓ (event onload)
new Image().src = dataURL    ← charge l'image en mémoire
        ↓ (event onload)
ratio = Math.min(1, maxWidth / img.width)
        ↓
canvas.width  = img.width  * ratio
canvas.height = img.height * ratio
        ↓
ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        ↓
canvas.toDataURL("image/webp", quality)
        ↓
data URL base64 WebP → stocké dans block.src (JSON)
```

### Paramètres selon le contexte d'upload

| Contexte | maxWidth | quality | Format sortie |
|---|---|---|---|
| Bloc image / galerie | 1400 px | 0.72 (72%) | WebP |
| Image de fond de page | 1920 px | 0.80 (80%) | WebP |
| Image header/footer | 1920 px | 0.80 (80%) | WebP |

### Pourquoi ces valeurs ?

- **1400 px** : largeur max typique d'une colonne de contenu sur un écran 1080p
- **72%** : bon compromis qualité/poids pour du contenu web
- **WebP** : jusqu'à 30% plus léger que JPEG à qualité équivalente, supporté par tous les navigateurs modernes
- **Fond de page à 1920 px / 80%** : le fond couvre tout l'écran, il faut plus de résolution et moins de compression

### Stockage

Les images ne sont pas uploadées sur un serveur de fichiers séparé. Le data URL base64 (ex: `data:image/webp;base64,/9j/...`) est stocké **directement dans le JSON** du bloc, qui est ensuite envoyé à l'API et stocké en MongoDB.

### Vidéos (pas de compression)

Les vidéos sont lues avec `FileReader.readAsDataURL()` sans compression, avec une limite de **100 Mo** :

```typescript
if (file.size > 100 * 1024 * 1024) {
  alert("Video too large (max 100 MB).");
  return;
}
```

---

## 9. L'éditeur de pages

Fichier principal : [src/admin/AdminPageEditor.tsx](src/admin/AdminPageEditor.tsx) (~2000 lignes)  
Hook d'état : [src/admin/Page editor/editorLogic.tsx](src/admin/Page%20editor/editorLogic.tsx)

### Disposition visuelle

```
┌─────────────────────────────────────────────────────────────┐
│  Toolbar (barre d'insertion + réglages)                     │
├───────────────────────────────┬─────────────────────────────┤
│                               │                             │
│  Canvas (zone de travail)     │  Panneau de propriétés      │
│  position: relative           │  (du bloc sélectionné)      │
│  overflow: auto               │                             │
│                               │                             │
└───────────────────────────────┴─────────────────────────────┘
│  MultiSelectionBar (si ≥2 blocs sélectionnés)               │
└─────────────────────────────────────────────────────────────┘
```

### État complet de l'éditeur

Tout l'état est géré dans `useEditorLogic(slug)` avec des `useState` React. Les principales variables :

```typescript
// Métadonnées de la page
const [title, setTitle]             = useState("");
const [navLabel, setNavLabel]       = useState("");
const [showInNav, setShowInNav]     = useState(true);
const [parentSlug, setParentSlug]   = useState(null);
const [navOrder, setNavOrder]       = useState(0);

// Fond du canvas
const [backgroundType, ...]         = useState("transparent");
const [backgroundColor, ...]        = useState("transparent");
const [backgroundGradientStart, ...] = useState("#2a2424");
const [backgroundGradientEnd, ...]  = useState("#433a68");
const [backgroundGradientAngle, ...] = useState(135);
const [backgroundImage, ...]        = useState("");
const [overlayEnabled, ...]         = useState(false);
const [overlayColor, ...]           = useState("#000000");
const [overlayOpacity, ...]         = useState(0.25);

// Blocs
const [blocks, setBlocks]           = useState([]);
const [selectedId, setSelectedId]   = useState(null);
const [selectedIds, setSelectedIds] = useState([]);  // multi-sélection

// Drag/resize/rotate
const [dragging, setDragging]       = useState(null);
const [resizing, setResizing]       = useState(null);
const [rotating, setRotating]       = useState(null);

// Grille d'accrochage
const [snapToGrid, setSnapToGrid]   = useState(false);
const [gridSize, setGridSize]       = useState(20);

// Historique (useRef pour éviter les re-renders)
const historyRef     = useRef([]);
const redoHistoryRef = useRef([]);
```

### Drag & Drop (déplacement d'un bloc)

Aucune librairie externe. Tout est fait avec des événements natifs `mousedown`, `mousemove`, `mouseup` sur `document`.

**Étape 1 — `onMouseDown` sur un bloc :**
```typescript
// CanvasBlock.tsx
onMouseDown={(e) => {
  if (block.locked) return;
  e.preventDefault();
  setDragging({
    id: block.id,
    startX: e.clientX,
    startY: e.clientY,
    origX: block.x,
    origY: block.y,
  });
}}
```

**Étape 2 — `onMouseMove` sur `document` :**
```typescript
useEffect(() => {
  function onMouseMove(e) {
    if (!dragging) return;
    let newX = dragging.origX + (e.clientX - dragging.startX);
    let newY = dragging.origY + (e.clientY - dragging.startY);

    // Snap to grid
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }

    updateBlock(dragging.id, { x: newX, y: newY });
  }
  document.addEventListener("mousemove", onMouseMove);
  return () => document.removeEventListener("mousemove", onMouseMove);
}, [dragging, snapToGrid, gridSize]);
```

**Étape 3 — `onMouseUp` :**  
Remet `dragging` à `null` et push un snapshot dans l'historique.

**Multi-drag :** si plusieurs blocs sont sélectionnés, leurs offsets relatifs sont calculés et stockés dans `multiDragOffsetsRef` au début du drag, puis appliqués à chaque frame.

### Redimensionnement

`ResizeHandle.tsx` — poignée en bas à droite de chaque bloc sélectionné.

```typescript
// ResizeHandle.tsx — onMouseDown
setResizing({
  id: block.id,
  startX: e.clientX,
  startY: e.clientY,
  origW: block.w,
  origH: block.h,
});

// onMouseMove
const newW = Math.max(20, resizing.origW + (e.clientX - resizing.startX));
const newH = Math.max(20, resizing.origH + (e.clientY - resizing.startY));
updateBlock(resizing.id, { w: newW, h: newH });
```

`Math.max(20, ...)` garantit une taille minimale de 20px pour ne pas perdre le bloc.

### Rotation

`RotateHandle.tsx` — poignée en haut à droite. La rotation est calculée en degrés à partir de l'angle entre le centre du bloc et la position de la souris.

```typescript
// onMouseMove
const blockCenterX = block.x + block.w / 2;
const blockCenterY = block.y + block.h / 2;
const angle = Math.atan2(
  e.clientY - blockCenterY,
  e.clientX - blockCenterX
) * (180 / Math.PI) + 90;  // +90° pour que "haut" = 0°

updateBlock(rotating.id, { rotation: Math.round(angle) });
```

### Conversion coordonnées souris → canvas

```typescript
// editorMathCalcul.ts
export function getCanvasPoint(e: MouseEvent, canvasEl: Element) {
  if (!canvasEl) return { x: 0, y: 0 };
  const rect = canvasEl.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  return { x, y };
}
```

`getBoundingClientRect()` tient compte du scroll et du zoom du canvas pour donner des coordonnées correctes.

### Snap to grid

Si `snapToGrid` est actif, toute coordonnée est arrondie au multiple de `gridSize` :

```typescript
const snapped = (v: number) => Math.round(v / gridSize) * gridSize;
newX = snapped(newX);
newY = snapped(newY);
```

Par défaut : `gridSize = 20px`. Configurable via la toolbar.

### Dirty flag et sauvegarde

`isDirty` est mis à `true` dès qu'un bloc est modifié. Le bouton "Sauvegarder" est visuellement mis en évidence. La sauvegarde appelle :

```typescript
await updatePage(slug, {
  title, navLabel, showInNav, parentSlug, navOrder,
  backgroundType, backgroundColor, /* ... */
  blocks,
});
window.dispatchEvent(new Event("pages:changed"));
```

---

## 10. Les boutons de la toolbar

### Boutons d'insertion de blocs (`Toolbar.tsx`)

Chaque bouton appelle `insertBlock(type)` dans `editorLogic.tsx`, qui crée un bloc avec des valeurs par défaut et l'ajoute à `blocks[]`.

**La position d'insertion** : par défaut `{ x: 100, y: 100 }`. Si l'utilisateur a fait un clic droit sur le canvas avant d'insérer, la position est celle du clic (stockée dans `pendingInsertPointRef`).

| Bouton toolbar | Type créé | Valeurs par défaut notables |
|---|---|---|
| **Text** | `text` | `fontSize: 24`, `w: 420`, `fillType: "gradient"` |
| **Image** | `image` | Ouvre `<input type="file" accept="image/*">` |
| **Box** | `box` | `w: 200`, `h: 120`, `color: boxColor` (couleur toolbar) |
| **Divider** | `divider` | `w: 400`, `thickness: 2` |
| **Button** | `button` | `label: "Click here"`, `paddingX: 24`, `paddingY: 12` |
| **Video** | `video` | Ouvre `<input type="file" accept="video/*">` |
| **Shape** | `shape` | Ouvre le picker de forme, puis insère le type choisi |
| **Emoji** | `emoji` | Ouvre le picker emoji natif |
| **Gallery** | `gallery` | `columns: 3`, `gap: 8`, `w: 600`, `h: 400` |
| **Countdown** | `countdown` | `targetDate: J+30`, `w: 420`, `h: 130` |
| **Quote** | `quote` | `w: 420`, `h: 200`, `accentColor: "#4f46e5"` |
| **Flip Card** | `flipCard` | `w: 300`, `h: 200`, `flipTrigger: "click"` |
| **Filter** | `filter` | `chipBorderRadius: 999`, `showCount: true` |
| **Group** | `group` | `w: 300`, `h: 200`, `blocks: []` |

### Menus contextuels (clic droit)

**Sur le canvas (zone vide) :**
- "Coller" (si `hasBlockClipboard()` retourne true)
- "Ajouter un bloc texte / image / box / …"

**Sur un bloc :**
- Modifier / Dupliquer (`duplicateBlock(id)` → clone avec nouvel ID, décalé de 20px)
- Supprimer (`deleteBlock(id)`)
- Couper (`cutBlock` → `writeBlockClipboard` + `deleteBlock`)
- Copier (`copyBlock` → `writeBlockClipboard`)
- Envoyer en arrière (`sendToBack` → donne le `zIndex` le plus bas - 1)
- Mettre au premier plan (`bringToFront` → donne le `zIndex` le plus haut + 1)
- Verrouiller / déverrouiller
- Changer de type (conversion partielle du bloc)

**Sur une sélection de texte :**
- Gras / Italique / Gras-Italique / Normal
- Couleur du texte sélectionné
- Taille de police (input numérique)

### Raccourcis clavier

| Raccourci | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+C` | Copier le bloc sélectionné |
| `Ctrl+X` | Couper le bloc sélectionné |
| `Ctrl+V` | Coller |
| `Delete` / `Backspace` | Supprimer le bloc sélectionné |
| `Escape` | Désélectionner |

### Bouton Sauvegarder

Le bouton "Save" est en gradient violet quand `isDirty` est `true`, grisé sinon. Il appelle `updatePage()` et dispatche `pages:changed`.

### Barre multi-sélection (`MultiSelectionBar.tsx`)

Apparaît quand `selectedIds.length >= 2`. Fonctions :
- **Affiche le compte** : "3 blocs sélectionnés"
- **Supprimer tout** : appelle `deleteBlock` sur chaque ID sélectionné
- **Désélectionner** : vide `selectedIds`
- **Aligner** : options d'alignement horizontal/vertical (par rapport au premier bloc sélectionné)

---

## 11. Le panneau de propriétés

Fichier : [src/admin/Page editor/components/PropertiesPanel.tsx](src/admin/Page%20editor/components/PropertiesPanel.tsx)

S'affiche à droite du canvas quand un bloc est sélectionné. Son contenu est **conditionnel** : chaque section s'affiche ou se masque selon le type du bloc actif.

### Section Position & Taille

Inputs numériques pour `x`, `y`, `w`, `h`, `rotation` (slider 0–360 + input), `zIndex`.

### Section Type de remplissage (couleur vs dégradé)

```
fillType: [ Couleur ] [ Dégradé ]
         ↓ si Couleur          ↓ si Dégradé
   <ColorInput />          <GradientPicker />
                          (2 colorpickers + angle 0–360)
```

**`ColorInput.tsx` :** `<input type="color">` avec affichage hex en texte. Le changement de couleur est appliqué en temps réel.

**`GradientPicker.tsx` :** deux `<ColorInput>` (début et fin) + un slider d'angle. Génère un `linear-gradient(angle, start, end)` prévisualisé en temps réel sur un `<div>`.

### Section Ombre

Checkbox `shadowEnabled` + si activée : sliders `shadowX`, `shadowY`, `shadowBlur`, `ColorInput` pour `shadowColor`, slider `shadowOpacity`.

### Section Bordure

**`BorderEditor.tsx` :**
- Checkbox `borderEnabled`
- Mode : "tous les côtés" ou "par côté" (toggle)
- Si "tous" : un seul input `borderWidth`
- Si "par côté" : 4 inputs `borderTopWidth`, `borderRightWidth`, `borderBottomWidth`, `borderLeftWidth`
- `ColorInput` pour la couleur
- Select `solid | dashed`

### Section Hover

Checkbox `hoverEnabled` + si activée : slider `hoverScale` (1.0–2.0), slider `hoverDuration`.

### Section Texte (uniquement pour `type: "text"`)

- Taille de police globale `fontSize`
- Style : Normal / Italic / Bold / Bold Italic
- `scaleX` (compression horizontale)

### Section Spécifique au type

Par exemple pour `gallery` : `columns`, `gap`, `borderRadius`.  
Pour `countdown` : `targetDate` (date picker), `label`.  
Pour `flipCard` : `flipTrigger`, `flipDuration`, accès aux blocs front/back.  
Etc.

### Section Verrouillage

Toggle `locked`. Un bloc verrouillé affiche un cadenas dans l'éditeur, ne peut pas être déplacé ou redimensionné (mais peut être sélectionné et déverrouillé).

---

## 12. Système de texte et segments

Fichier : [src/utils/textSegments.ts](src/utils/textSegments.ts) (448 lignes)

### Pourquoi les segments ?

Un simple `string` ne permet pas d'avoir des styles différents sur des parties du texte (une partie rouge, une autre en dégradé, une autre plus grande). Les segments résolvent ce problème.

Un bloc texte contient un tableau `segments: TextSegment[]`. Chaque segment est une portion du texte avec son propre style :

```typescript
interface TextSegment {
  id: string,
  text: string,            // Portion du texte
  color: string,           // Couleur hex
  fontStyle: string,       // normal | italic | bold | bolditalic
  fillType: string,        // color | gradient
  gradientStart: string,
  gradientEnd: string,
  gradientAngle: number,
  fontSize: number,        // null = hérite du bloc
  scaleX: number,          // null = hérite du bloc
}
```

### Comment le texte est affiché (`buildSegmentsHtml`)

```typescript
export function buildSegmentsHtml(block) {
  const normalized = normalizeTextBlock(block);
  return normalized.segments.map((seg) => {
    const style = buildSegmentInlineStyle(seg, normalized);
    const text = escapeHtml(seg.text).replace(/\n/g, "<br>");
    return `<span data-seg-id="${seg.id}" style="${style}">${text}</span>`;
  }).join("");
}
```

**`buildSegmentInlineStyle`** calcule le style CSS de chaque span :

```typescript
function buildSegmentInlineStyle(segment, block) {
  // fontSize : segment > bloc > 16px
  const fontSize = segment.fontSize ?? block.fontSize ?? 16;

  // scaleX relatif : si le bloc a scaleX=2 et le segment scaleX=3 → span à 1.5x
  const relativeScaleX = blockScaleX !== 0 ? segScaleX / blockScaleX : 1;

  // Dégradé sur le texte
  if (fillType === "gradient") {
    return [
      `background-image: linear-gradient(${angle}deg, ${start}, ${end})`,
      "background-clip: text",
      "-webkit-background-clip: text",
      "color: transparent",
      "-webkit-text-fill-color: transparent",
    ].join("; ");
  }
  return `color: ${segment.color}`;
}
```

### Pourquoi deux fonctions HTML distinctes ?

`buildSegmentsHtml` (affichage public) utilise les dégradés CSS.  
`buildSegmentsEditHtml` (éditeur contenteditable) utilise des **couleurs solides** à la place. Raison : Chrome ne supporte pas `background-clip: text` + `-webkit-text-fill-color: transparent` dans un `contenteditable`, le curseur devient invisible et la sélection de texte est cassée. En mode édition, la couleur du dégradé est remplacée par `gradientStart`.

### Parsing du DOM après édition (`parseSegmentsFromElement`)

Quand l'utilisateur modifie le texte dans le contenteditable, la fonction parcourt le DOM nœud par nœud pour reconstruire les segments :

```typescript
export function parseSegmentsFromElement(element, originalBlock) {
  // Map id → segment original (pour récupérer les styles)
  const segmentLookup = new Map(originalBlock.segments.map(s => [s.id, s]));

  function walk(node, currentSegId) {
    if (node.nodeType === 3) {  // Nœud texte
      const text = node.textContent.replace(/​/g, ""); // retire les zero-width spaces
      appendText(currentSegId, text);
      return;
    }
    if (node.tagName === "BR") { appendText(currentSegId, "\n"); return; }
    if (node.tagName === "DIV" || node.tagName === "P") {
      if (result.length > 0) appendText(currentSegId, "\n"); // saut de ligne entre divs
    }
    const segId = node.getAttribute?.("data-seg-id") || currentSegId;
    node.childNodes.forEach(child => walk(child, segId));
  }

  element.childNodes.forEach(child => walk(child, null));
}
```

Chaque `<span data-seg-id="...">` mappe son texte vers le segment original pour récupérer son style.

### Appliquer un style à une sélection (`applyTextSelectionPatch`)

Quand l'utilisateur sélectionne "Bonjour Epitech" et clique sur "Dégradé violet" :

```typescript
export function applyTextSelectionPatch(block, selectionStart, selectionEnd, patch) {
  // selectionStart/End sont des indices de caractères dans le texte complet
  let cursor = 0;
  const nextSegments = [];

  block.segments.forEach((segment) => {
    const segStart = cursor;
    const segEnd   = cursor + segment.text.length;
    cursor = segEnd;

    if (segEnd <= selectionStart || segStart >= selectionEnd) {
      // Hors sélection → inchangé
      nextSegments.push(segment);
      return;
    }

    // Partie avant la sélection (même style)
    if (localStart > 0)
      nextSegments.push({ ...segment, id: uid(), text: text.slice(0, localStart) });

    // Partie sélectionnée (nouveau style)
    nextSegments.push({ ...segment, ...patch, id: uid(), text: text.slice(localStart, localEnd) });

    // Partie après la sélection (même style)
    if (localEnd < text.length)
      nextSegments.push({ ...segment, id: uid(), text: text.slice(localEnd) });
  });

  return { ...block, segments: normalizeTextSegments(nextSegments, block) };
}
```

Résultat : le segment "Bonjour Epitech" est découpé en 3 segments, le du milieu recevant le nouveau style.

### Fusion des segments adjacents

`mergeAdjacentSegments()` est appelé après chaque modification. Si deux segments consécutifs ont exactement le même style, ils sont fusionnés en un seul. Cela évite que l'arbre de segments explose après de nombreuses éditions.

```typescript
function sameSegmentStyle(left, right) {
  return (
    left.color === right.color &&
    left.fontStyle === right.fontStyle &&
    left.fillType === right.fillType &&
    // ... toutes les propriétés de style
  );
}
```

### Déduplication des segments répétés

`dedupeMirroredSegments()` et `dedupeRepeatedText()` détectent si le tableau de segments (ou le texte d'un segment) est une répétition cyclique, et le remplace par une seule période. Cela corrige un bug où le contenteditable peut dupliquer le contenu lors de certaines interactions de collage.

---

## 13. Undo / Redo

Fichier : [src/utils/historyState.ts](src/utils/historyState.ts)

### Principe

À chaque action significative (déplacement, redimensionnement, modification de propriété, ajout/suppression de bloc), un snapshot complet de l'état est poussé dans `historyRef`.

```typescript
export function pushHistoryEntry(historyRef, snapshot, limit = 80) {
  // Ajoute le snapshot et garde seulement les 80 derniers
  historyRef.current = [...historyRef.current, cloneHistoryValue(snapshot)].slice(-limit);
}

export function popHistoryEntry(historyRef) {
  if (!historyRef.current.length) return null;
  const nextHistory = [...historyRef.current];
  const snapshot = nextHistory.pop();
  historyRef.current = nextHistory;
  return cloneHistoryValue(snapshot);
}
```

### Clonage profond

```typescript
export function cloneHistoryValue(value) {
  // Utilise structuredClone si disponible (navigateurs modernes)
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  // Fallback : JSON roundtrip (perd les undefined et les fonctions, ce qui est OK pour les données)
  return JSON.parse(JSON.stringify(value));
}
```

`structuredClone` est préféré car plus performant et gère les types spéciaux (Date, Map, etc.).

### Snapshot contenu

Le snapshot contient toutes les variables d'état qui doivent être restaurées :

```typescript
function captureCurrentSnapshot() {
  return {
    title, navLabel, backgroundType, backgroundColor,
    backgroundGradientStart, backgroundGradientEnd, backgroundGradientAngle,
    overlayEnabled, overlayColor, overlayOpacity,
    bottomPadding, blocks, selectedId, showInNav, backgroundImage,
  };
}
```

### Undo et Redo

```typescript
function undo() {
  const snapshot = popHistoryEntry(historyRef);
  if (!snapshot) return;
  // Avant de restaurer, sauvegarde l'état actuel dans le redo
  pushHistoryEntry(redoHistoryRef, captureCurrentSnapshot());
  restoreSnapshot(snapshot);
}

function redo() {
  const snapshot = popHistoryEntry(redoHistoryRef);
  if (!snapshot) return;
  pushHistoryEntry(historyRef, captureCurrentSnapshot());
  restoreSnapshot(snapshot);
}
```

`restoreSnapshot()` applique toutes les valeurs du snapshot via leurs setters React respectifs.

### Optimisation : snapshots de drag

Le drag ne push pas un snapshot à chaque `mousemove` (ce serait des centaines par seconde). Il est suivi via `interactionHistoryRef` :
- `mousedown` → snapshot capturé et mis en attente
- `mouseup` → snapshot poussé dans l'historique seulement une fois

---

## 14. Copy / Paste

Fichier : [src/utils/blockClipboard.ts](src/utils/blockClipboard.ts)

### État du clipboard

Un objet module (singleton, pas un state React) :

```typescript
const clipboardState = {
  kind: null,           // "block" | "text" | null
  block: null,          // Copie du dernier bloc copié
  text: null,           // Copie du dernier texte copié
  pasteCount: 0,        // Compteur de colle successifs
};
```

### Copier un bloc

```typescript
export function writeBlockClipboard(block) {
  clipboardState.kind = "block";
  clipboardState.block = cloneValue(block);  // structuredClone ou JSON roundtrip
  clipboardState.pasteCount = 0;             // Reset du compteur
  return true;
}
```

### Coller un bloc

```typescript
export function readPastedBlock({ offsetStep = 24 } = {}) {
  if (!hasBlockClipboard()) return null;

  clipboardState.pasteCount += 1;  // Incrémente à chaque colle

  const offset = offsetStep * clipboardState.pasteCount;  // Décalage cumulatif
  const clonedBlock = refreshNestedIds(cloneValue(clipboardState.block));

  return {
    ...clonedBlock,
    x: (clonedBlock.x ?? 0) + offset,  // Décalé de 24px * n
    y: (clonedBlock.y ?? 0) + offset,
  };
}
```

Ainsi, si on colle 3 fois le même bloc, ils sont à `+24px`, `+48px`, `+72px` du bloc original. Visuellement, ils s'empilent en escalier.

### Régénération des IDs (`refreshNestedIds`)

Après clonage, **tous** les IDs sont régénérés pour éviter les doublons :

```typescript
function refreshNestedIds(block) {
  const nextBlock = {
    ...block,
    id: createId(getBlockPrefix(block.type)),  // Nouvel ID pour le bloc
  };

  // Régénère les IDs des segments de texte
  if (Array.isArray(nextBlock.segments)) {
    nextBlock.segments = nextBlock.segments.map(seg => ({ ...seg, id: createId("seg") }));
  }

  // Régénère récursivement les blocs enfants (group, flipCard)
  if (Array.isArray(nextBlock.blocks)) {
    nextBlock.blocks = nextBlock.blocks.map(child => refreshNestedIds(child));
  }
  if (Array.isArray(nextBlock.frontBlocks)) {
    nextBlock.frontBlocks = nextBlock.frontBlocks.map(child => refreshNestedIds(child));
  }

  return nextBlock;
}
```

Cette récursivité est importante : un groupe contenant 5 blocs enfants doit avoir 5 nouveaux IDs enfants, pas juste un nouvel ID de groupe.

---

## 15. Système de filtrage

### Vue d'ensemble

Le système de filtrage permet d'avoir des boutons de catégories sur une page qui affichent/masquent dynamiquement des blocs. Exemple : une page avec des cartes d'événements, filtrables par "Sport", "Culture", "Social".

### Mise en place côté admin

1. Créer des blocs normaux (box, image, etc.) et leur attribuer des tags dans le panneau de propriétés, champ `filterTags` (ex: `["Sport"]`)
2. Insérer un bloc de type `filter` sur le canvas

### Fonctionnement dans `PageBlocksRenderer.tsx`

```typescript
// État du filtre actif
const [activeFilters, setActiveFilters] = useState<string[]>([]);

// Le bloc filter collecte tous les tags uniques des blocs de la page
const allTags = blocks
  .filter(b => b.type !== "filter")
  .flatMap(b => b.filterTags || [])
  .filter((v, i, arr) => arr.indexOf(v) === i);  // unique

// Quand on clique sur un chip :
setActiveFilters(prev =>
  prev.includes(tag) ? prev.filter(t => t !== tag) : [tag]
);

// Un bloc est visible si aucun filtre actif OU si il a le tag actif
const isVisible = activeFilters.length === 0 || 
  block.filterTags?.some(t => activeFilters.includes(t));
```

### Algorithme de reflow (`computeLayoutAdjustments`)

Quand un filtre est actif, les blocs visibles se repositionnent pour remplir les "trous" laissés par les blocs masqués. L'algorithme (dans `PageBlocksRenderer.tsx:1238`) :

```typescript
function computeLayoutAdjustments(allBlocks, activeFilters) {
  if (activeFilters.length === 0) return {};  // Pas de filtre → pas de reflow

  // 1. Trier les blocs filtrables par Y puis par X → reconstituer les "lignes"
  const sortedByY = filterable.sort((a, b) => a.y - b.y);
  const rows = [];
  for (const block of sortedByY) {
    // Un bloc appartient à une ligne si sa Y est à moins de 80px d'un bloc existant
    const row = rows.find(r => r.some(rb => Math.abs(rb.y - block.y) < 80));
    if (row) row.push(block);
    else rows.push([block]);
  }

  // 2. Identifier la largeur de grille (nombre max de colonnes)
  const maxCols = Math.max(...rows.map(r => r.length));
  // Positions X des colonnes (prises depuis la ligne la plus large)
  const colXPositions = referenceRow.map(b => b.x);

  // 3. Calculer la hauteur médiane des lignes (pour éviter qu'une ligne anormalement
  //    haute fausse l'espacement)
  const rowHeights = rows.map((row, i) => nextRowY - currentRowY);
  const medianRowHeight = [...rowHeights].sort((a, b) => a - b)[Math.floor(rowHeights.length / 2)];

  // 4. Replacer chaque bloc visible en ordre de lecture (gauche→droite, haut→bas)
  visibleBlocks.forEach((block, idx) => {
    const targetRow = Math.floor(idx / maxCols);
    const targetCol = idx % maxCols;
    const targetX = colXPositions[targetCol];
    const targetY = originY + targetRow * medianRowHeight;
    // Si différent de la position originale → enregistrer l'ajustement
    if (targetX !== block.x || targetY !== block.y) {
      adjustments[block.id] = { x: targetX, y: targetY };
    }
  });
}
```

**Transition CSS :** les blocs se déplacent avec une animation fluide :
```typescript
const REFLOW_TRANSITION = "left 0.4s cubic-bezier(0.4, 0, 0.2, 1), top 0.4s cubic-bezier(0.4, 0, 0.2, 1)";
```

Chaque bloc utilise `adjX(b)` et `adjY(b)` qui retournent la position ajustée si un ajustement existe, ou la position originale sinon.

---

## 16. Système Reveal

Le système Reveal permet d'afficher/masquer des blocs quand on survole un autre bloc. Utile pour des effets "hover sur une carte → apparition d'un texte".

### Propriétés

Toutes les propriétés sont sur des blocs normaux (aucun type spécial) :

| Propriété | Rôle |
|---|---|
| `revealEnabled: true` | Ce bloc est un **déclencheur** de reveal |
| `revealTag: string` | Tag du groupe (ex: `"card1"`) |
| `revealHidden: true` | Ce bloc est **masqué par défaut**, s'affiche quand le déclencheur du même tag est survolé |
| `revealDefault: true` | Ce bloc est **visible par défaut**, se masque quand n'importe quel déclencheur est actif |

### Implémentation dans `PageBlocksRenderer.tsx`

```typescript
// État : quel tag est actif par groupe
const [activatedTagPerGroup, setActivatedTagPerGroup] = useState(new Map());

function handleRevealHover(tag: string) {
  const group = getRevealGroup(tag);  // ex: "card1-front" → groupe "card1"
  setActivatedTagPerGroup(prev => {
    const next = new Map(prev);
    next.set(group, tag);
    return next;
  });
}

// Style d'un bloc revealHidden
if (block.revealHidden && block.revealTag) {
  const group = getRevealGroup(block.revealTag);
  const active = activatedTagPerGroup.get(group) === block.revealTag;
  return {
    opacity: active ? 1 : 0,
    pointerEvents: active ? undefined : "none",
    transition: "opacity 0.25s ease",
  };
}

// Style d'un bloc revealDefault
if (block.revealDefault) {
  const shouldHide = activatedTagPerGroup.has(block.revealTag);
  return {
    opacity: shouldHide ? 0 : 1,
    pointerEvents: shouldHide ? "none" : undefined,
    transition: "opacity 0.25s ease",
  };
}
```

**Groupes :** le tag peut contenir un tiret (`"card1-front"`). La partie avant le premier tiret est le groupe (`"card1"`). Cela permet d'avoir plusieurs "cibles" dans un même groupe reveal qui s'activent exclusivement.

---


`observer.disconnect()` après la première animation : l'animation ne se répète pas si l'utilisateur scrolle en arrière puis revient. C'est délibéré pour éviter un effet répétitif désagréable.

---

## 18. Ombres et bordures

### Ombre portée

Fonction `getBlockBoxShadow()` dans `PageBlocksRenderer.tsx:11` :

```typescript
export function getBlockBoxShadow(block) {
  if (!block?.shadowEnabled) return undefined;

  // Conversion hex #RRGGBB → entiers r, g, b
  const hex = block.shadowColor || "#000000";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = block.shadowOpacity ?? 0.4;

  return `${block.shadowX ?? 4}px ${block.shadowY ?? 4}px ${block.shadowBlur ?? 12}px rgba(${r},${g},${b},${a})`;
}
// Exemple : "8px 8px 24px rgba(0,0,0,0.5)"
```

### Bordures (technique inset shadow)

Fonction `getBlockBorder()` dans `PageBlocksRenderer.tsx:21` :

```typescript
export function getBlockBorder(block, existingBoxShadow?) {
  if (!block?.borderEnabled) return {};

  const c  = block.borderColor || "#ffffff";
  const s  = block.borderStyle || "solid";
  const top    = block.borderTopWidth    ?? block.borderWidth ?? 2;
  const right  = block.borderRightWidth  ?? block.borderWidth ?? 2;
  const bottom = block.borderBottomWidth ?? block.borderWidth ?? 2;
  const left   = block.borderLeftWidth   ?? block.borderWidth ?? 2;

  if (s === "solid") {
    // Technique : utilise box-shadow inset pour simuler chaque côté
    // Cela permet de combiner avec l'ombre portée dans un seul box-shadow
    const inset = [
      top    > 0 && `inset 0 ${top}px 0 0 ${c}`,       // bord haut
      right  > 0 && `inset -${right}px 0 0 0 ${c}`,    // bord droit
      bottom > 0 && `inset 0 -${bottom}px 0 0 ${c}`,   // bord bas
      left   > 0 && `inset ${left}px 0 0 0 ${c}`,      // bord gauche
    ].filter(Boolean).join(", ");

    // Si une ombre portée existe déjà, on les combine
    const combined = [inset, existingBoxShadow].filter(Boolean).join(", ");
    return { boxShadow: combined };
  }

  // Pour "dashed" : on ne peut pas simuler des tirets avec box-shadow, on utilise border CSS
  return {
    borderTop:    `${top}px ${s} ${c}`,
    borderRight:  `${right}px ${s} ${c}`,
    borderBottom: `${bottom}px ${s} ${c}`,
    borderLeft:   `${left}px ${s} ${c}`,
  };
}
```

**Pourquoi inset shadow et non border CSS pour solid ?**  
Parce que `box-shadow` multiple peut combiner l'ombre portée et la bordure dans une seule déclaration CSS, sans affecter le `box-sizing` ni le `layout`. `border` CSS impacte les dimensions du box-model.

---

## 19. Header et Footer

### Éditeur du Header (`AdminSiteSettings.tsx`)

L'interface est divisée en deux colonnes :

```
┌─────────────────────────────┬─────────────────────────────┐
│  Aperçu (HeaderPreview)     │  Réglages (HeaderSettings   │
│  Canvas interactif          │  Panel + SelectedBlockPanel)│
│  même taille que le vrai    │                             │
│  header                     │                             │
└─────────────────────────────┴─────────────────────────────┘
```

**`HeaderPreview.tsx`** — Canvas interactif identique à `SiteHeader` mais avec drag/sélection :
- Clic sur un bloc → le sélectionne (affiche `SelectedBlockPanel`)
- Drag → déplace le bloc
- `onMouseMove` / `onMouseUp` sur document pour le drag

**`HeaderSettingsPanel.tsx`** — Réglages globaux :
- Type de fond : `color | image`
- Si image : upload avec `compressImage(file, 1920, 0.8)` + sliders de position X/Y
- Slider `overlayOpacity` (0–1)
- Input `height` : hauteur du header en px

**Sauvegarde :**
```typescript
await saveSiteSettings({ header: { ...settings, blocks } });
window.dispatchEvent(new Event("site:changed"));
```

`SiteHeader.tsx` écoute cet événement et recharge les settings sans refresh.

### Éditeur du Footer (`AdminFooterEditor.tsx`)

Architecture identique au header. Le footer est une **page CMS standard** avec le slug spécial `__footer__`.

**Création automatique :** si la page `__footer__` n'existe pas en base (première utilisation), elle est créée automatiquement :

```typescript
// Dans useEditorLogic
if (!p && slug === "__footer__") {
  const created = await addPage({
    title: "Footer",
    slug: "__footer__",
    showInNav: false,  // N'apparaît jamais dans la nav
  });
  p = created.page;
}
```

---

## 20. Administration

### Tableau de bord (`AdminDashboard.tsx`)

**Stats affichées :**
- Nombre de pages publiées
- Nombre de blocs dans le header
- Statut de connexion API

**Export backup :**
```typescript
const data = {
  pages: await loadPages(),
  siteSettings: await loadSiteSettings(),
  exportedAt: new Date().toISOString(),
};
const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
// Téléchargement : "backup-epitech-2026-05-22.json"
```

**Import backup :**
```typescript
// Lit le fichier JSON uploadé
const data = JSON.parse(fileContent);
await savePages(data.pages);          // PUT /api/pages/bulk
await saveSiteSettings(data.siteSettings);
window.dispatchEvent(new Event("pages:changed"));
window.dispatchEvent(new Event("site:changed"));
```

### Gestion des pages (`AdminPagesList.tsx`)

**Création d'une page :**
1. L'utilisateur saisit un titre (ex: "School Events")
2. Le slug est auto-généré : `"school-events"` (toLowerCase + remplacement espaces par tirets)
3. `POST /api/pages` avec `{ title, slug, showInNav: true, navOrder: 0 }`
4. Redirection vers l'éditeur

**Hiérarchie parent/enfant :**  
Chaque page peut avoir un `parentSlug`. Dans la liste, les enfants sont indentés sous leur parent. Dans la navbar, ils apparaissent en dropdown.

**Réordonnancement :**  
Drag & drop sur la liste → modifie les `navOrder` → `PUT /api/pages/bulk` avec la liste complète mise à jour.

### Gestion des utilisateurs (`AdminUsers.tsx`)

| Action | Appel API |
|---|---|
| Lister | `GET /api/users` |
| Créer | `POST /api/users` avec `{ name, email, password, role }` |
| Changer le rôle | `PATCH /api/users/:id/role` avec `{ role: "ADMIN" \| "STAFF" }` |
| Supprimer | `DELETE /api/users/:id` |

---

## 21. Authentification JWT

### Connexion (`AdminLogin.tsx`)

```typescript
// 1. POST sur l'API
const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
// 2. Récupère le token JWT
const { token } = res.data;
// 3. Stocke dans localStorage
localStorage.setItem("token", token);
// 4. Redirige vers /admin
navigate("/admin");
```

L'inscription (`/api/auth/register`) crée un compte en attente qui doit être validé par un admin.

### Protection des routes (`ProtectedRoute.tsx`)

À chaque navigation vers `/admin/*` :

```typescript
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/admin/login" />;

  // Décodage du payload JWT (base64) sans vérification de signature
  // (la vérification réelle se fait côté API)
  const payloadB64 = token.split(".")[1];
  const payload = JSON.parse(atob(payloadB64));

  // Vérification de l'expiration
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    localStorage.removeItem("token");
    return <Navigate to="/admin/login" />;
  }

  // Vérification du rôle admin
  if (payload.role !== "ADMIN") {
    return <Navigate to="/admin/login" />;
  }

  return children;
}
```

### Headers d'authentification

Ajoutés à toutes les requêtes protégées dans `mockData.ts` :

```typescript
function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Exemple d'utilisation
await axios.put(`${API_BASE}/api/pages/${slug}`, data, { headers: authHeaders() });
```

---

## 22. Communication API

Fichier : [src/admin/mockData.ts](src/admin/mockData.ts)

### URL de base

```typescript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001"
```

### Endpoints et fonctions

**Pages publiques (sans auth) :**

| Fonction | Méthode | URL |
|---|---|---|
| `loadPages()` | `GET` | `/api/pages` |
| `getPage(slug)` | `GET` | `/api/pages/:slug` |

**Pages admin (avec auth) :**

| Fonction | Méthode | URL | Body |
|---|---|---|---|
| `addPage(page)` | `POST` | `/api/pages` | Objet page |
| `updatePage(slug, page)` | `PUT` | `/api/pages/:slug` | Objet page |
| `deletePage(slug)` | `DELETE` | `/api/pages/:slug` | — |
| `savePages(pages)` | `PUT` | `/api/pages/bulk` | `{ pages: [...] }` |

**Site settings :**

| Fonction | Méthode | URL |
|---|---|---|
| `loadSiteSettings()` | `GET` | `/api/site-settings` |
| `saveSiteSettings(s)` | `PUT` | `/api/site-settings` |

**Utilisateurs :**

| Fonction | Méthode | URL |
|---|---|---|
| `loadUsers()` | `GET` | `/api/users` |
| `createUser(data)` | `POST` | `/api/users` |
| `updateUserRole(id, role)` | `PATCH` | `/api/users/:id/role` |
| `deleteUser(id)` | `DELETE` | `/api/users/:id` |

**Auth :**

| Fonction | Méthode | URL |
|---|---|---|
| `login(email, password)` | `POST` | `/api/auth/login` |
| `register(name, email, pw)` | `POST` | `/api/auth/register` |

### Gestion des erreurs

Les fonctions renvoient soit les données directement, soit un objet `{ ok: false, error }`. Les composants vérifient `response.ok` avant d'utiliser les données.

---

## 23. Styles et theming

### `index.css` — Thème global

```css
@import "tailwindcss";  /* Tailwind CSS v4 */

body {
  background-color: #1f1f1f;
  color: rgba(255, 255, 255, 0.87);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: 0;
}

a { text-decoration: none; }
```

### `admin.css` — Design system du back-office

**Variables CSS (`:root`) :**

```css
:root {
  --admin-bg:      #0a0a18;                    /* Fond très sombre (bleu-noir) */
  --admin-surface: rgba(22, 22, 40, 0.7);      /* Cartes et panneaux */
  --admin-text:    #f5f5fb;                    /* Texte principal */
  --admin-muted:   rgba(245, 245, 251, 0.5);  /* Texte secondaire */
  --admin-accent:  #7c3aed;                    /* Violet (boutons, liens actifs) */
  --admin-success: #10b981;                    /* Vert */
  --admin-danger:  #ef4444;                    /* Rouge */
  --admin-border:  rgba(255, 255, 255, 0.08); /* Bordures subtiles */
  --admin-radius:  12px;                       /* Arrondi standard */
  --admin-shadow:  0 8px 24px rgba(0,0,0,0.3);
}
```

**Classes CSS principales :**

| Classe | Description |
|---|---|
| `.adminShell` | Grid `260px 1fr` (sidebar + main) |
| `.adminSidebar` | Sidebar fixe, gradient `#0a0a18 → #120f2e` |
| `.adminLink` | Lien nav : hover `background violet transparent`, transition |
| `.adminLink.active` | Lien actif : fond violet, texte blanc |
| `.adminCard` | Surface avec `backdrop-blur`, arrondi, shadow |
| `.adminBtn` | Bouton : `height:38px`, `border-radius:8px`, `font-weight:500` |
| `.adminBtn.primary` | Fond violet `var(--admin-accent)` |
| `.adminBtn.secondary` | Fond transparent + bordure |
| `.adminBtn.danger` | Fond rouge `var(--admin-danger)` |
| `.adminPageHeader` | En-tête de page : titre + description + actions |
| `.adminGrid` | `display:grid; grid-template-columns: 1fr 1fr` |
| `.adminGrid.cols3` | `grid-template-columns: 1fr 1fr 1fr` |

### `editorStyles.ts` — Styles CSS-in-JS de l'éditeur

Constantes exportées et utilisées dans tous les composants de l'éditeur :

```typescript
export const inputStyle = {
  padding: "6px 10px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "6px",
  color: "#fff",
  fontSize: 13,
  transition: "border-color 0.15s",
  // focus → border-color: rgba(124,58,237,0.6)
};

export const btnSaveStyle = {
  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "8px 20px",
  fontWeight: 600,
  cursor: "pointer",
};

export const panelStyle = {
  background: "rgba(16,16,28,0.97)",
  backdropFilter: "blur(12px)",
  borderLeft: "1px solid rgba(255,255,255,0.08)",
  overflow: "auto",
};
```

### Tailwind CSS v4

Intégré via le plugin Vite `@tailwindcss/vite` (pas de `tailwind.config.js`). Utilisé pour les classes utilitaires dans les composants. Pas de personnalisation de thème — les valeurs par défaut Tailwind sont utilisées telles quelles.

---

## 24. Événements fenêtre

Communication en temps réel entre composants sans state management global. Deux événements personnalisés sur `window` :

### `pages:changed`

**Dispatché après :**
- Création d'une page (`addPage`)
- Mise à jour d'une page (`updatePage`)
- Suppression d'une page (`deletePage`)
- Mise à jour en masse (`savePages`)

```typescript
window.dispatchEvent(new Event("pages:changed"));
```

**Écouté par :**

| Composant | Action au déclenchement |
|---|---|
| `Navbar.tsx` | Recharge `loadPages()` → met à jour les liens |
| `CMSPage.tsx` | Recharge la page si son slug a changé |
| `AdminDashboard.tsx` | Rafraîchit les stats |

### `site:changed`

**Dispatché après :**
- Sauvegarde du header (`saveSiteSettings`)

```typescript
window.dispatchEvent(new Event("site:changed"));
```

**Écouté par :**

| Composant | Action |
|---|---|
| `SiteHeader.tsx` | Recharge `loadSiteSettings()` → met à jour la bannière |

---

## 25. Utilitaires

### `gradients.ts`

```typescript
export function buildLinearGradient(angle: number, start: string, end: string): string {
  return `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;
}

export function getPageGradientConfig(page) {
  return {
    angle: page?.backgroundGradientAngle ?? 135,
    start: page?.backgroundGradientStart ?? "#2a2424",
    end:   page?.backgroundGradientEnd   ?? "#433a68",
  };
}

export function getBlockGradientConfig(block) {
  return {
    angle: block?.gradientAngle ?? 135,
    start: block?.gradientStart ?? block?.color ?? "#ffffff",
    end:   block?.gradientEnd   ?? "#f59e0b",
  };
}
```

### `editorMathCalcul.ts`

```typescript
// ID unique pour les blocs
export function uid(): string {
  return "b_" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

// Contraint une valeur entre min et max
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// Convertit les coordonnées souris en coordonnées relatives au canvas
export function getCanvasPoint(e: MouseEvent, canvasEl: Element) {
  const rect = canvasEl.getBoundingClientRect();
  return {
    x: Math.round(e.clientX - rect.left),
    y: Math.round(e.clientY - rect.top),
  };
}

// Hauteur dynamique du canvas
export function calculateCanvasHeight(blocks, minHeight, padding = 400) {
  let maxY = 0;
  for (const b of blocks) {
    if (b.type === "text") maxY = Math.max(maxY, b.y + 140);
    if (b.type === "link") maxY = Math.max(maxY, b.y + 120);
    if (b.type === "box" || b.type === "image")
      maxY = Math.max(maxY, b.y + (b.h ?? 0) + 140);
  }
  return Math.max(minHeight, maxY + padding);
}

// Convertit le fontStyle interne en propriétés CSS
export function styleToCss(fontStyle: string) {
  switch (fontStyle) {
    case "italic":     return { fontStyle: "italic", fontWeight: 400 };
    case "bold":       return { fontStyle: "normal", fontWeight: 700 };
    case "bolditalic": return { fontStyle: "italic", fontWeight: 700 };
    default:           return { fontStyle: "normal", fontWeight: 400 };
  }
}
```

### `useToast.ts` — Notifications

```typescript
const [toast, setToast] = useState<{ message: string, type: string } | null>(null);

function showToast(message: string, type = "info", duration = 3000) {
  setToast({ message, type });
  setTimeout(() => setToast(null), duration);
}
```

Affiché en overlay en bas de l'éditeur. Types : `"success"`, `"error"`, `"info"`.

---

*Documentation générée le 22 mai 2026*  
*Frontend Epitech Berlin — Quentin Charillon*
