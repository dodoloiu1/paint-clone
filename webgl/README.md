# Paint Clone - WebGL Hardware-Accelerated Web Edition

Versiunea Web cu motor de randare **WebGL 2.0 / WebGL 1.0** accelerat hardware pe GPU, amplasata in subfolderul dedicat `webgl/`.

## Arhitectura WebGL (`WebGLRenderer`)

Aplicatia foloseste un pipeline hibrid GPU + Raster:
1. **Context WebGL2 / WebGL1 (`#glCanvas`)**:
   - Incarca si gestioneaza textura principala a documentului pe GPU (`gl.TEXTURE_2D` cu `gl.texImage2D` si `gl.texSubImage2D`).
   - Detecteaza placa video prin extensia `WEBGL_debug_renderer_info` si afiseaza indicatorul `WebGL2 GPU` in bara de titlu.
2. **Vertex & Fragment Shaders (GLSL)**:
   - **GPU Pixel Grid Shader**: Calculeaza direct in fragment shader grila de pixeli (1px screen-space) atunci cand nivelul de zoom este `>= 400%` sau cand optiunea *Gridlines* este activata, fara niciun overhead DOM/CSS.
   - **Filtre GPU in timp real**:
     - `Normal`
     - `Invert (GPU)`
     - `Grayscale / Luminance (GPU)`
     - `Sepia Tone (GPU)`
   - **Filtrare Textura**: Comutare instantanee intre `gl.NEAREST` (pixel-art clar, fara blur) si `gl.LINEAR` (interpolare biliniara).
3. **Citire Pixeli pe GPU**:
   - Unealta *Color Picker (Eyedropper)* esantioneaza direct din framebuffer-ul WebGL folosind `gl.readPixels()`.
4. **Rezilienta Context GPU**:
   - Tratare completa pentru evenimentele `webglcontextlost` si `webglcontextrestored`.

## Comutare Motor Randare (GPU WebGL ⇄ CPU Canvas 2D) & Diagnosticare Hardware

Aplicatia include un panou complet de setari hardware si diagnosticare, accesibil din:
- **Title Bar**: Click pe pilula de stare `GPU: WebGL2 ⚙` sau butonul `Switch to CPU / Switch to GPU`.
- **Home Ribbon**: Grupul dedicat `Hardware (GPU/CPU)` cu buton de toggle si acces la setari.
- **View Ribbon**: Butonul `Settings ⚙` din grupul WebGL Shaders & GPU.
- **Status Bar**: Badge-ul interactiv cu motorul curent si viteza ultimului fill (`GPU (WebGL2) • Fill: ...`).
- **File Menu**: Optiunea `Hardware & GPU Settings...`.

### Capabilitati Diagnosticare si Telemetrie Live
- **Model GPU & Vendor**: Detectie automata prin extensia WebGL (`UNMASKED_RENDERER_WEBGL` si `UNMASKED_VENDOR_WEBGL`).
- **Dimensiune maxima textura hardware**: Afiseaza rezolutia maxima suportata de GPU (ex: `16384 × 16384 px`).
- **Consum Memorie & Pixeli**: Dimensiuni canvas curente, MegaPixeli si footprint RAM (ex: `10000 × 10000 px (100 MP • 381.5 MB RAM)`).
- **Viteza Flood Fill & Sync GPU**: Masurare precisa in timp real in milisecunde si MP/s.
- **Plafonare Inteligenta Texturi Mari (10kx10k)**: Plafonare configurabila a texturii GPU (`4096px`, `8192px`, `16384px`) prin canvas de staging pentru a preveni epuizarea VRAM-ului si artefactele vizuale pe suprafete gigant.

## Optimizare Flood Fill (Bucket) pentru Canvas-uri Gigant (10kx10k)
- **Algoritm Directional Shadow-Span Scanline**:
  - Evita recursivitatea si depasirea limitei de lungime a array-ului V8 (`RangeError: Invalid array length`).
  - Pre-alocare pe typed array `Int32Array` cu redimensionare dinamica.
  - Zero alocare de array `visited` (economiseste 100 MB pe un canvas de 10kx10k).
  - Umplere SIMD pe linii orizontale prin `Uint32Array.fill()`.
  - Comparatie corecta pe 32-bit unsigned (`>>> 0`) pentru a preveni erorile de semn pe canalul alfa.
  - Test de performanta integrat: umple 100.000.000 de pixeli in ~100 ms!

## Cum se ruleaza

Deschide `webgl/index.html` in orice browser modern sau porneste un server local:
```bash
npx serve webgl
```
Sau direct in browser:
```bash
start webgl/index.html
```
