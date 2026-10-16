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

## Cum se ruleaza

Deschide `webgl/index.html` in orice browser modern sau porneste un server local:
```bash
npx serve webgl
```
