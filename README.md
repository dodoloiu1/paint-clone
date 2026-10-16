# Windows Paint Clone (Web & Windows Desktop Native)

O recreere fidela si modernizata a aplicatiei **Windows 11 Paint**, cu Fluent Design, suport complet pentru teme Dark / Light, zoom pe pixeli cu afisare raster/gridline, desen vectorial cu manere interactive de redimensionare, curbe Bezier in 3 pasi, unelte de selectie si salvare directa pe disc.

![Paint Preview](app_dark_mode.png)

## Structura Branch-urilor

Proiectul este structurat in branch-uri dedicate:
- **`main`**: Depozitul complet continand atat versiunea Web, cat si subfolderul aplicatiei Desktop Electron.
- **`web`**: Branch dedicat exclusiv versiunii Web statice (gata pentru rulare in orice browser sau deploy pe GitHub Pages).
- **`windows-electron`**: Branch dedicat exclusiv aplicatiei native de Windows Desktop (cu `Paint.exe`, `main.js`, `preload.js`, `package.json` direct in radacina).

---

## Functionalitati Cheie

- **UI & Teme**:
  - Interfata Windows 11 Fluent Ribbon (tab-uri Home / View, grupuri de unelte, selector de culori extins).
  - Comutator complet **Dark / Light Mode** pozitionat in bara de jos (Status Bar) si in meniu (`Ctrl + Shift + D`).
  - Text si iconite optimizate pentru contrast si vizibilitate ridicata in ambele teme.
- **Canvas & Zoom pe Pixeli**:
  - Zoom de la **25% pana la 800%**.
  - La zoom de peste 400%, pixelii se maresc si devine vizibila grila de pixeli individuali (Pixel Grid), recreand comportamentul din Paint.
  - Redimensionare dinamica de canvas cu manere de tragere (dreapta, jos, colt).
- **Unelte de Desenare**:
  - **Pencil, Brush** (Caligrafic, Airbrush, Ulei, Crayon, Marker, Acuarela), **Eraser, Fill Bucket, Color Picker, Text**.
  - **Linii & Forme geometrice cu manere interactive**: dupa trasare, apar manere de control pentru redimensionare si mutare inainte de commit pe panza (`Enter` sau click in exterior).
  - **Curba Bezier in 3 pasi**: trasezi linia initiala, apoi ajustezi punctul de curbura intermediar.
- **Clipboard & Selectie**:
  - Selectie dreptunghiulara (`Ctrl + A`, `Ctrl + X`, `Ctrl + C`, `Ctrl + V`, `Delete`).
  - Optiune Transparent Selection.
- **Istoric**:
  - Undo (`Ctrl + Z`) si Redo (`Ctrl + Y`) cu stiva de snapshots.

---

## Lansare Rapida

### 1. Versiunea Web (in Browser)
Deschide pur si simplu fisierul `index.html` in orice browser modern:
```bash
# Sau foloseste un server HTTP local:
npx serve .
```

### 2. Versiunea Desktop Windows
Navigheaza in folderul `desktop/`:
```bash
cd desktop
npm start
```
Sau da dublu-click direct pe **`Paint.exe`** sau **`run.bat`** (fara ferestre negre de consola, cu dialoguri native Windows Save/Open si scriere directa pe disc).

---

## Licenta
MIT
