# Paint-Clone Specification & Reverse Engineering Evidence

This specification documents the feature set of Windows Paint extracted from the reference binary `C:/re/paint2/mspaint.exe` (and `C:/re/paint/mspaint.exe`) using REA (Reverse Engineer Anything) static analysis tools: `binary_overview`, `inspect_pe_resources`, `list_strings`, and `search_strings`.

---

## 1. Binary Overview & Artifact Identity

Evidence obtained via `binary_overview` (REA composed investigation workflow):
- **Target File Path**: `C:/re/paint2/mspaint.exe`
- **SHA-256 Digest**: `d94d89377a2a78a73b95cff70fc7706df9ae2ae53175bd6d26abb8301e36ecd9`
- **Binary Format**: PE32+ (64-bit executable, x86_64)
- **Product Name**: `Paint` (String address: `0x1404132d0`)
- **Product Version / File Version**: `11.2605.81.0` (String address: `0x1404131a4`, `0x140413300`)
- **Company Name**: `Microsoft Corporation` (String address: `0x140413118`)
- **Internal / Original Filename**: `mspaint.exe` (String address: `0x14041316c`, `0x140413298`)
- **Evidence ID**: `ev_927838756874a75f59c1e880408dbe6316a73cc8697c5c0aa487b77bc7838ccd`
- **Segments** (9 total):
  - `Headers`: `0x140000000` - `0x140000400` (1,024 bytes)
  - `.text`: `0x140001000` - `0x1400dfc00` (912,384 bytes, code)
  - `.rdata`: `0x1400e0000` - `0x140178c00` (625,664 bytes, read-only data, symbols, string references)
  - `.data`: `0x140179000` - `0x1401d0ea0` (360,096 bytes, writable data)
  - `.pdata`: `0x1401d1000` - `0x1401dc200` (45,568 bytes, exception tables)
  - `.didat`: `0x1401dd000` - `0x1401dd200` (512 bytes, delay import descriptors)
  - `.rsrc`: `0x1401de000` - `0x140413800` (2,316,288 bytes, resources)
  - `.reloc`: `0x140414000` - `0x140418200` (16,896 bytes, base relocations)
  - `tdb`: `0xff00000000` - `0xff00001850` (6,224 bytes)
- **Total Procedures Analyzed**: 5,722
- **Total Defined String Entities**: 3,177

---

## 2. PE Resources (`inspect_pe_resources`)

Analysis of `.rsrc` table (102 resource entities examined across 215 directory entries):
- **RT_CURSOR (Type 1)**: 28 cursor items
- **RT_BITMAP (Type 2)**: 1 bitmap resource
- **RT_ICON (Type 3)**: 16 icons across multiple resolutions (16x16, 20x20, 24x24, 32x32, 40x40, 48x48, 64x64, 256x256)
- **RT_DIALOG (Type 5)**: 3 win32 dialog templates:
  - Dialog ID `133`: Main/Canvas dialog properties (RVA `4270800`, 1,022 bytes, Font: `Segoe UI`)
  - Dialog ID `134`: Close/Prompt dialog (RVA `4272160`, 60 bytes, Text: `Close`)
  - Dialog ID `135`: Shell confirmation dialog (RVA `4271824`, 330 bytes, Font: `MS Shell Dlg`)
- **RT_GROUP_CURSOR (Type 12)**: 28 cursor groups with resource IDs:
  - IDs: `9263`, `9264`, `9265`, `9266`, `9267`, `9268`, `9269`, `9270`, `9271`, `9272`, `9273`, `9274`, `9275`, `9276`, `9277`, `9278`, `9279`, `9280`, `9281`, `9282`, `9283`, `9284`, `9285`, `9286`, `9293`, `9294`, `9295`, `9296`
  - Mapping to individual tools: pencil, eraser, eyedropper, flood fill, crosshair/shapes, zoom in/out, move/pan, selection, resize handles.
- **RT_GROUP_ICON (Type 14)**: 2 icon groups (IDs `100`, `101`)
- **RT_VERSION (Type 16)**: ID `1`, Language `1033` (English US), ProductVersion `11.2605.81.0`
- **RT_MANIFEST (Type 24)**: ID `1`, `Microsoft.Windows.Shell.mspaint`, `PerMonitorV2` DPI-awareness
- **IMAGE (Custom PNG Resources)**: 20 PNG asset files (IDs `50095` - `50153`, verified with PNG header `0x89 0x50 0x4E 0x47`) containing tool icons, brush stroke previews, and UI glyphs.

---

## 3. Tool Suite & Shapes

Extracted from string table, demangled C++ symbol table, and `CPaintTool` subclasses:

### 3.1 Primary Tools
| Tool Name | Class / Constructor Symbol | String Address & Identifier | Functionality |
| :--- | :--- | :--- | :--- |
| **Pencil** | `CPencilTool` (`0x140171a86`) | `0x140112e18`: `PencilToolAccessibleName` | 1px or thin freehand drawing |
| **Eraser** | `EraserTool` (`0x140171d5a`) | `0x140112de0`: `EraserToolAccessibleName` | Erases to background color (Color 2) or transparent |
| **Fill Bucket** | `FloodTool` (`0x140171d0a`) | `0x140112d40`: `FillToolAccessibleName` | 4-connected / 8-connected flood fill with tolerance |
| **Color Picker** | `PickColorTool` (`0x140171cb6`) | `0x140112da0`: `ColorPickerToolAccessibleName`| Samples pixel color under cursor (Color 1 on left-click, Color 2 on right-click) |
| **Magnifier / Zoom**| `ZoomTool` (`0x140171c66`) | `0x140112d70`: `ZoomToolAccessibleName` | Zooms in (left-click) or out (right-click) at point |
| **Text** | `TextTool` (`0x140171e4a`) | `0x140112d10`: `TextToolAccessibleName` | Places editable text box with font, size, B/I/U/S formatting |
| **Rect Selection** | `SelectionTool` (`0x1401718d0`) | `0x140112ca0`: `PickToolAccessibleName` | Selects rectangular pixel region, movable/resizable |
| **Freeform Selection**| `FreeFormSelectionTool` (`0x140171942`) | `0x140112cd0`: `FreeFormPickToolAccessibleName` | Freehand lasso pixel selection |

### 3.2 Brushes
Extracted from `CBrushTool`, `CCalligraphicTool`, and `CSkeletalStrokeTool` (`0x1401721da`):
- **Standard Brush**: `BrushToolAccessibleName` (`0x140112e50`), smooth circular stroke
- **Calligraphy Brush 1**: `FortyFiveDegreeBrushToolAccessibleName` (`0x140112e80`), 45° angled chisel tip
- **Calligraphy Brush 2**: `OneThirtyFiveDegreeBrushToolAccessibleName` (`0x140112ed0`), 135° angled chisel tip
- **Airbrush**: `AirBrushToolAccessibleName` (`0x140112f28`), scattered spray particle effect
- **Oil Brush**: `OilBrushToolAccessibleName` (`0x140112f60`), bristle texture stroke
- **Crayon**: `CrayonToolAccessibleName` (`0x140112f98`), waxy textured stroke
- **Marker**: `MarkerToolAccessibleName` (`0x140112fd0`), semi-translucent broad stroke
- **Natural Pencil**: `NaturalPencilToolAccessibleName` (`0x140113010`), soft graphite texture
- **Watercolor**: `WaterColorToolAccessibleName` (`0x140113050`), translucent feathering stroke

### 3.3 Shapes
Extracted from `ShapeFactory` functions and shape accessible names:
| Shape Name | Factory Method (`ShapeFactory::...`) | Accessible Name String Address |
| :--- | :--- | :--- |
| **Line** | `CLineTool` (`0x140171eb6`) | `0x140113090`: `LineToolAccessibleName` |
| **Curve (Bezier)** | `CBezierTool` (`0x140171f06`) | `0x1401130c0`: `CurveToolAccessibleName` |
| **Rectangle** | `CreateRectangle` (`0x14017002e`) | `0x140113128`: `RectToolAccessibleName` |
| **Rounded Rectangle** | `CreateRoundedRectangle` (`0x14017009e`) | `0x140113158`: `RoundRectToolAccessibleName` |
| **Ellipse / Circle** | `CreateEllipse` (`0x140170116`) | `0x1401130f0`: `EllipseToolAccessibleName` |
| **Polygon** | `CPaintPolygonTool` (`0x140171f58`) | `0x140113190`: `PolygonToolAccessibleName` |
| **Triangle** | `CreateTriangle` (`0x140170184`) | `0x1401131c8`: `TriangleToolAccessibleName` |
| **Right Triangle** | `CreateRightAngledTriangle` (`0x1401701f4`) | `0x140113200`: `RightTriangleToolAccessibleName` |
| **Diamond** | `CreateDiamond` (`0x14017026e`) | `0x140113240`: `DiamondToolAccessibleName` |
| **Pentagon** | `CreatePentagon` (`0x1401702dc`) | `0x140113278`: `PentagonToolAccessibleName` |
| **Hexagon** | `CreateHexagon` (`0x14017034c`) | `0x1401132b0`: `HexagonToolAccessibleName` |
| **Right Arrow** | `CreateRightArrow` (`0x140170590`) | `0x1401132e8`: `RigthArrowToolAccessibleName` |
| **Left Arrow** | `CreateLeftArrow` (`0x140170520`) | `0x140113328`: `LeftArrowToolAccessibleName` |
| **Up Arrow** | `CreateUpArrow` (`0x140170602`) | `0x140113360`: `UpArrowToolAccessibleName` |
| **Down Arrow** | `CreateDownArrow` (`0x140170670`) | `0x140113398`: `DownArrowToolAccessibleName` |
| **4-Point Star** | `CreateFourPointedStar` (`0x1401706e0`) | `0x1401133d0`: `FourPointStarToolAccessibleName` |
| **5-Point Star** | `CreateFivePointedStar` (`0x140170756`) | `0x140113410`: `FivePointStarToolAccessibleName` |
| **6-Point Star** | `CreateSixPointedStar` (`0x1401707cc`) | `0x140113450`: `SixPointStarToolAccessibleName` |
| **Rounded Callout** | `CreateRoundedRectangularCallout` (`0x1401704a0`)| `0x140113490`: `RoundRectCalloutToolAccessibleName` |
| **Oval Callout** | `CreateOvalCallout` (`0x1401703ba`) | `0x1401134d8`: `OvalCalloutToolAccessibleName` |
| **Cloud Callout** | `CreateCloudCallout` (`0x14017042c`) | `0x140113518`: `CloudCalloutToolAccessibleName` |
| **Heart** | `CreateHeart` (`0x140170842`) | `0x140113558`: `HeartToolAccessibleName` |
| **Lightning** | `CreateLightning` (`0x1401708ae`) | `0x140113588`: `LightningToolAccessibleName` |

### 3.4 Shape Options & Stroke Styles
- **Outline Styles**: No Outline, Solid Color, Crayon, Marker, Oil, Natural Pencil, Watercolor (`OutlineChangeAnnouncement` `0x140115d50`)
- **Fill Styles**: No Fill, Solid Color, Crayon, Marker, Oil, Natural Pencil, Watercolor (`FillChangeAnnouncement` `0x140115d20`)
- **Stroke Width**: 1px, 2px, 3px, 4px, 5px, 8px, 10px (`RaiseSuggestedThicknessesChanged` `0x14017c620`, `BrushSizeIncreasedAnnouncement` `0x140118278`, `BrushSizeDecreasedAnnouncement` `0x1401182f0`)

---

## 4. Color System

Extracted from color classes and strings:
- **Color 1 (Foreground)**: Drawing color for pencil, brushes, outlines (`ActiveColorSlot` `0x1401089f0`)
- **Color 2 (Background)**: Secondary color for eraser, right-click, shape fills (`EditBackgroundColor` `0x1401089c8`, `Change background color` `0x140108a00`)
- **Quick Palette**: Standard Windows Paint 20-swatch palette:
  - Row 1: Black, Dark Gray, Dark Red, Red, Orange, Yellow, Green, Turquoise, Indigo, Purple
  - Row 2: White, Light Gray, Brown, Rose, Gold, Light Yellow, Lime, Light Turquoise, Blue-Gray, Lavender
- **Edit Colors Dialog**: `PaintUI.EditColorsDialog` (`0x140109428`), `PaintUI.EditColorsDialogViewModel` (`0x1401094c0`), allowing arbitrary RGB/HSL color definition and adding custom colors.

---

## 5. Menus and Commands

Extracted from `PaintCommandHostAdapter::Execute` (`0x14017c930`) and announcement strings:

### 5.1 File Menu
- **New** (`0x140115e60`): Creates new clean canvas (prompts if modified)
- **Open** (`0x114a30`, `0x140113870`): Opens image from disk
- **Save** (`0x1401137e8`, `0x1401138a0`): Overwrites existing file
- **Save As** (`0x140115a40`): Exports to PNG, JPEG, BMP, GIF, TIFF
- **Print** (`0x14010f560`, `0x14010fa00`): Print current canvas
- **Page Setup** (`0x1401197b0`): Paper size, orientation, margins, centering, scaling
- **Set as Desktop Background** (`0x140117f50`): Fill, Tile, Center
- **Image Properties** (`0x140118940`): Dimensions, units, colorspace
- **Exit** (`0x140115148`): Close application with unsaved changes prompt

### 5.2 Edit Menu / Operations
- **Undo** (`0x14010d810`, `0x140118200`): Reverts last canvas action
- **Redo** (`0x140118250`): Re-applies reverted action
- **Cut** (`0x140118128`): Copies selection to clipboard and clears region
- **Copy** (`0x140105f10`, `0x1401180d8`): Copies selection to clipboard
- **Paste** (`0x1401180b0`): Pastes clipboard image at top-left
- **Paste From** (`0x140117ff8`): Inserts image file directly into canvas selection
- **Delete** (`0x140118100`): Clears current selection to background color
- **Select All** (`0x1401181d0`): Selects full canvas
- **Invert Selection** (`0x140118198`, `0x140171556`): Inverts selected pixels

### 5.3 Image Transformations
- **Crop** (`0x14010d770`, `0x140118228`): Crops canvas to current selection boundary
- **Resize and Skew** (`0x14010d6b0`, `0x140117f78`): Resizes canvas or selection by percentage or pixels; skews horizontally/vertically
- **Rotate 90° Right / 90° Left / 180°** (`0x14010d760`, `0x140118170`)
- **Flip Horizontal / Flip Vertical** (`0x14010d6c0`, `0x14010d6e0`, `0x140118148`)
- **Invert Colors** (`0x14010d700`, `0x140171530`): Bitwise NOT on RGB channels
- **Clear Canvas** (`0x14010d780`)

### 5.4 View Menu & UI Chrome
- **Zoom In / Zoom Out / 100% Zoom** (`0x140112d70`, `0x14011a3e8`)
- **Rulers Toggle** (`TraceRulers` `0x1401710c4`)
- **Gridlines Toggle** (`TraceGrid` `0x140171016`)
- **Status Bar Toggle** (`0x140106cc8`):
  - Cursor Coordinates: `X, Y px`
  - Selection Dimensions: `W x H px`
  - Canvas Dimensions: `W x H px`
  - Zoom Percentage: `100%`, slider control

---

## 6. Dialogs & Prompts

Extracted from string table and resource templates:
1. **Resize and Skew Dialog** (`PaintUI.ResizeAndSkewDialog` `0x1401188e8`):
   - Options: By Percentage (Horizontal %, Vertical %) or By Pixels (Width, Height)
   - Maintain Aspect Ratio checkbox
   - Skew in Degrees (Horizontal °, Vertical °)
2. **Image Properties Dialog** (`PaintUI.ImagePropertiesDialog` `0x140118940`):
   - Units: Inches, Centimeters, Pixels
   - Colorspace: Black and White, Color
   - Width and Height inputs
   - Current canvas resolution & file size
3. **Edit Colors Dialog** (`PaintUI.EditColorsDialog` `0x140109428`):
   - 48 basic color grid + 16 custom color slots
   - Color spectrum box + Luminance slider
   - RGB inputs (0-255) and HSL inputs
4. **Save Changes Prompt** (`SaveChangesDialogTitle` `0x1401137f8`, `SaveChangesText` `0x140113850`, `DontSaveButtonText` `0x140113828`):
   - "Do you want to save changes to Untitled?"
   - Buttons: Save, Don't Save, Cancel
5. **Page Setup Dialog** (`PageSetupDialogTitle` `0x1401197b0`):
   - Paper size, source, portrait/landscape orientation, margins (left, right, top, bottom), centering, scaling.

---

## 7. Supported File Formats

Extracted from string table, GDI+ encoder/decoder APIs, and WIC integrations:
- **PNG** (`.png`, `image/png` at `0x1401115e0`, `0x140119e60`): Lossless 24/32-bit with alpha channel (Primary default)
- **JPEG** (`.jpg`, `.jpeg`): 24-bit lossy photography compression
- **BMP** (`*.bmp`, `*.dib`, `*.rle` at `0x140115e70`, `0x140115e80`, `0x140115e90`):
  - Monochrome (1-bit): `MonoChromeBitmap` (`0x140115ac8`)
  - 16-color (4-bit): `SixteenColorBitmap` (`0x140115aa0`)
  - 256-color (8-bit): `TwoHundredAndFiftySixColorBitmap` (`0x140115b10`)
  - 24-bit TrueColor: `TrueColorBitmap` (`0x140115af0`)
- **GIF** (`.gif`): 8-bit palette
- **TIFF** (`.tiff`, `.tif`): High dynamic range lossless
- **Paint Project** (`*.paint` at `0x140115ea0`, `PaintProjectFileFormat` `0x140115d88`): Multi-layer project schema

---

## 8. Keyboard Shortcuts

Standard Windows Paint shortcut map confirmed by action dispatch handlers:
- `Ctrl + N`: New canvas
- `Ctrl + O`: Open file
- `Ctrl + S`: Save
- `Ctrl + Shift + S` / `F12`: Save As
- `Ctrl + P`: Print
- `Ctrl + Z`: Undo
- `Ctrl + Y`: Redo
- `Ctrl + X`: Cut
- `Ctrl + C`: Copy
- `Ctrl + V`: Paste
- `Delete`: Delete selection
- `Ctrl + A`: Select All
- `Ctrl + Shift + I`: Invert Selection
- `Ctrl + W`: Resize and Skew
- `Ctrl + E`: Image Properties
- `Ctrl + Shift + X`: Crop
- `Ctrl + R`: Toggle Rulers
- `Ctrl + G`: Toggle Gridlines
- `Ctrl + Plus` / `Ctrl + MouseWheelUp`: Zoom In
- `Ctrl + Minus` / `Ctrl + MouseWheelDown`: Zoom Out
- `Ctrl + 0`: 100% Zoom (Reset)
- `Ctrl + [` / `Ctrl + ]`: Decrease / Increase Brush or Line Thickness
- `P`: Pencil
- `E`: Eraser
- `B`: Brush
- `G` / `F`: Flood Fill Bucket
- `I`: Color Picker (Eyedropper)
- `T`: Text Tool
- `M`: Rectangle Select
- `Z`: Zoom Tool

---

## 9. Implementation Architecture for Paint-Clone

To achieve complete portability and high performance without external binary dependencies, the implementation will be built as a self-contained single-page HTML5/Canvas web application in `C:/re/paint-clone/index.html` (accompanied by clean modular architecture in separate files or bundled single HTML as specified).

### Core Components to implement:
1. **Interactive Dual-Layer Canvas**:
   - Background canvas (persistent pixel buffer)
   - Preview canvas (for live shape preview, brush preview, selection marquee)
2. **Tools Engine (Independent Implementation)**:
   - **Pencil**: Crisp Bresenham line interpolation for continuous smooth pixel drawing
   - **Eraser**: Configurable size square/circle eraser to background color or transparency
   - **Shapes**: Line, Rectangle, Rounded Rectangle, Ellipse/Circle, Triangle, Right Triangle, Diamond, Pentagon, Hexagon, Arrows (Left, Right, Up, Down), Stars (4-point, 5-point, 6-point), Callouts, Heart, Lightning
   - **Shape Options**: Stroke outline color/size, optional Fill mode (None vs Solid fill with Color 2)
   - **Flood Fill**: High-performance stack-based 4-way flood fill algorithm with color distance threshold
   - **Color Picker (Eyedropper)**: Pixel color extraction from canvas context
   - **Brush Suite**: Standard brush, calligraphy chisel, airbrush particles, marker, crayon/watercolor textures
   - **Selection & Marquee**: Drag-to-select, move selection, delete selection
3. **Color Palette & Swatches**:
   - Primary (Color 1) and Secondary (Color 2) color slots
   - 20-color classic Paint swatch bar
   - Custom color picker modal with RGB/Hex
4. **History Stack**:
   - Robust Undo and Redo stack using canvas ImageData snapshots (with memory limit & state deduplication)
5. **Canvas Operations & Transformations**:
   - Resize canvas with drag handles and via Resize/Skew dialog
   - Rotate 90° clockwise, 90° counter-clockwise, 180°
   - Flip horizontally, Flip vertically
   - Invert colors (RGB complement)
   - Crop to selection
   - Clear canvas
6. **File Operations**:
   - Save / Export PNG (lossless standard)
   - Save / Export JPEG, BMP, WebP
   - Open image file from disk (drag-and-drop & file picker)
   - New blank canvas with unsaved changes dialog
7. **UI Chrome & Accessibility**:
   - Windows 11 / Classic ribbon hybrid aesthetic with dark/light theme support
   - Live status bar with cursor coordinates `(x, y)`, selection size, canvas resolution, and zoom percentage
   - Zoom controls (slider + buttons + wheel)
   - Gridlines and Rulers overlay toggle
   - Full keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`, `Ctrl+S`, `Ctrl+O`, `Ctrl+N`, `Delete`, `Ctrl+A`, `Ctrl+G`, etc.)
   - **Dark Theme Toggle**: Full system-aware & manual Dark Mode toggle (Title Bar Sun/Moon button, View Tab checkbox, File Menu item, shortcut `Ctrl+Shift+D`, and `localStorage` persistence).
8. **Pixelated Zoom & Crisp Pixel Engine**:
   - Canvas configured with `image-rendering: pixelated` and `imageSmoothingEnabled = false` for authentic Paint pixel scaling.
   - Bresenham integer line algorithm (`drawPixelLine`) for the Pencil tool with zero antialiasing halos.
   - Eraser tool utilizes square pixel block erasure with Color 2.
   - Dynamic pixel grid overlay aligned to individual canvas pixels at high zoom (`zoom >= 200%` and Gridlines toggle `Ctrl+G`).
   - Pixel-targeted magnifier tool and `Ctrl + Wheel` zooming centered on the cursor's pixel.

