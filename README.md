# Paint - Aplicatie Nativa Windows Desktop

Versiunea nativa Windows pentru Paint Clone, complet autonoma, cu integrare nativa de sistem de operare, ferestre native, meniuri native si scriere directa pe disc.

## Fisiere Principale

- **`Paint.exe`**: Executabil nativ C# compilat cu pictograma Paint (`icon.ico`). Se deschide direct prin dublu-click, fara ferestre negre de consola (zero console flicker).
- **`run.bat`**: Script batch rapid pentru lansare directa.
- **`main.js`**: Procesul principal Electron ce gestioneaza fereastra nativa, barele de meniu Windows, integrarea cu clipboard si dialogurile native de sistem (`Save As`, `Open`).
- **`preload.js`**: Podul de comunicare securizat (`contextBridge`) intre sistemul nativ si interfata aplicatiei.
- **`index.html`**: Interfata completa Paint cu Dark/Light mode, zoom pe pixeli cu afisare gridline, tool-uri avansate (curba in 3 pasi, dreptunghiuri, elipse cu manere de redimensionare, umplere, text etc.).
- **`package.json`**: Configuratia de pachete si scriptul `npm start`.
- **`icon.png` / `icon.ico`**: Pictogramele native ale aplicatiei.

## Cum se lanseaza aplicatia

Ai 3 modalitati simple de a o porni:

1. **Dublu-click pe `Paint.exe`** direct in folder.
2. **Dublu-click pe `run.bat`**.
3. **Din terminal**:
   ```bash
   npm install
   npm start
   ```

## Functionalitati Native Windows

- **Dialoguri native File Open / Save**:
  - Salvare directa in formatele **PNG**, **JPEG** sau **BMP (Bitmap 24-bit)** fara dialoguri de descarcare in browser.
  - Sincronizare automata a numelui fisierului salvat direct in bara de titlu a ferestrei Windows.
- **Meniuri native si scurtaturi Windows**:
  - `Ctrl + N`: Imagine noua
  - `Ctrl + O`: Deschide imagine existenta (cu dialog nativ de explorator)
  - `Ctrl + S`: Salveaza imaginea direct pe disc
  - `Ctrl + Z`: Undo
  - `Ctrl + Y`: Redo
  - `Ctrl + Shift + D`: Comuta Tema Intunecata / Luminoasa
  - `Ctrl + =` / `Ctrl + -`: Zoom in / Zoom out
  - `Ctrl + 0`: Reset zoom la 100%
  - `Ctrl + G`: Afiseaza / ascunde grila de pixeli
  - `F11`: Fullscreen
- **Drag & Drop**:
  - Poti trage orice imagine direct din Windows Explorer in fereastra Paint pentru a o deschide automat.
- **Deschidere din linia de comanda**:
  - Poti deschide o imagine direct: `Paint.exe "C:\cale\catre\poza.png"`.
