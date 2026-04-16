# MarkFlow: Walkthrough & User Guide

MarkFlow is a premium, minimalist Markdown editor and reader for Windows that supports Mermaid diagrams and PDF export.

## Features Delivered

### 1. Minimalist GitHub-Style UI
A clean, focused interface inspired by GitHub's aesthetic. It features a split-pane layout with a high-performance editor and a real-time preview.

### 2. Live Mermaid Visualization
Supports all Mermaid diagram types (Flowcharts, Sequence Diagrams, Gantt, etc.). Diagrams are rendered instantly as you type.

### 3. Integrated Markdown Editor
Built with **CodeMirror 6**, offering a professional editing experience with syntax highlighting, line numbering, and smooth performance.

### 4. Direct PDF Export
A one-click solution to export your Markdown documents (including rendered Mermaid diagrams) to professional A4 PDF files.

## Files Created

- [main.js](file:///d:/project_eric/markflow/main.js): Electron main process.
- [renderer.src.js](file:///d:/project_eric/markflow/renderer.src.js): Source code for the renderer.
- [renderer.js](file:///d:/project_eric/markflow/renderer.js): Bundled renderer code.
- [index.html](file:///d:/project_eric/markflow/index.html): UI structure.
- [style.css](file:///d:/project_eric/markflow/style.css): Aesthetic styling.

## How to Run the App

1. Ensure you are in the `d:\project_eric\markflow` directory.
2. Run the following command in your terminal:
   ```powershell
   npm start
   ```

## How to use
1. **Editing**: Just start typing in the left pane.
2. **Opening Files**: Click the **Open** button in the toolbar to load an existing `.md` file.
3. **Saving**: Click the **Save** button. If it's a new file, it will prompt for a location.
4. **Exporting**: Click **Export PDF** to save your document as a PDF.

> [!TIP]
> Use the vertical bar between the editor and preview to resize the panes to your preference.
