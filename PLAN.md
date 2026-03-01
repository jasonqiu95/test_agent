# Vellum Clone - Implementation Plan

## Overview

Building a professional book formatting tool (Vellum clone) as a cross-platform Electron desktop application from scratch. This is a complete publishing toolchain that transforms manuscripts into beautiful ebooks and print-ready PDFs.

## Tech Stack

- **Framework**: Electron 28+ with React 18 and TypeScript 5
- **Rich Text Editor**: ProseMirror (powerful, extensible)
- **State Management**: Zustand with Immer (simple, TypeScript-friendly)
- **Styling**: Tailwind CSS (rapid development, dark theme support)
- **DOCX Import**: mammoth.js (best maintained library)
- **EPUB Export**: jszip + custom builder (full control)
- **PDF Export**: pdfkit (mature pagination support)
- **Drag & Drop**: @dnd-kit (modern, accessible)
- **Build Tools**: Vite (fast HMR) + electron-builder (packaging)

## Architecture

### 3-Panel UI Layout
- **Left Panel**: Navigator (Contents/Styles tabs)
- **Center Panel**: Rich text editor OR style browser
- **Right Panel**: Live preview (device modes: phone/tablet/print)

### Core Data Model
```typescript
BookProject {
  metadata: { title, author, isbn, language }
  elements: BookElement[]
  styleConfig: { selectedStyle, customizations }
  exportSettings: { trimSize, coverPath }
}

BookElement {
  id, type, title, order
  content: ProseMirror JSON
}
```

## Implementation Phases

### Phase 1: Electron Foundation (✓ Days 1-2)
- Initialize npm project with electron, react, typescript
- Configure Vite for Electron (main + renderer)
- Set up IPC bridge with typed API
- Create basic window
- Configure electron-builder
- **Goal**: `npm start` opens window

### Phase 2: Core UI Layout (Days 3-4)
- 3-panel layout with resizable splitters
- Navigator, Editor, Preview panel shells
- Menu bar (File, Edit, View, Format, Generate)
- Dark theme support
- **Goal**: Professional layout structure

### Phase 3: Data Models & State (Day 5)
- TypeScript interfaces in models/Book.ts
- Zustand store with undo/redo
- Sample project data
- **Goal**: State management working

### Phase 4: Rich Text Editor (Days 6-8)
- ProseMirror integration
- Document schema (paragraphs, headings, lists, etc.)
- Custom marks (scene breaks, ornamental breaks)
- Formatting toolbar
- Keyboard shortcuts
- **Goal**: Full-featured editing

### Phase 5: Navigator - Element Management (Days 9-10)
- Element tree rendering
- Drag-and-drop reordering
- Add/delete/duplicate elements
- Element type selector
- Context menus
- **Goal**: Complete element management

### Phase 6: Project Save/Load (Days 11-12)
- Save/Save As dialogs
- JSON serialization (.vellum files)
- Open project dialog
- Auto-save every 30 seconds
- Unsaved changes indicator
- **Goal**: Persistent projects

### Phase 7: DOCX Import (Days 13-14)
- Import Word Document dialog
- mammoth.js integration
- Chapter detection heuristics
- HTML to ProseMirror conversion
- Import preview/adjustment UI
- **Goal**: Accurate DOCX import

### Phase 8: Book Styles System (Days 15-17)
- 12+ style definitions (Serif, Sans Serif, Script, Modern)
- Style browser component
- Style engine (definition → CSS)
- Dynamic style application
- Style customization UI
- Save custom styles
- **Goal**: Beautiful, instant styling

### Phase 9: Live Preview (Days 18-20)
- Preview renderer (HTML + applied styles)
- Device mode selector (iPhone, iPad, Kindle, Print)
- Viewport sizing
- Page-turn navigation
- Live updates on edit
- Zoom controls
- **Goal**: Accurate live preview

### Phase 10: EPUB Generation (Days 21-23)
- EPUB builder service with jszip
- EPUB structure generation
- ProseMirror → XHTML conversion
- Style CSS application
- Metadata and TOC generation
- Cover image embedding
- EPUB 3 validation
- **Goal**: Professional EPUB output

### Phase 11: PDF Generation (Days 24-27)
- Trim size presets (6+ options)
- PageLayout service with pdfkit
- Text measurement and pagination
- Page numbers (inside/outside)
- Headers/footers
- Chapter starts on recto pages
- Widow/orphan control
- Bleeds and crop marks
- **Goal**: Print-ready PDFs

### Phase 12: Polish & Features (Days 28-30)
- Word count display
- Comprehensive keyboard shortcuts
- Preferences dialog
- Document search (Cmd+F)
- Export progress indicators
- Tooltips and hints
- UI polish (icons, animations)
- Error handling
- **Goal**: Production-ready app

## Required Features Checklist

### Core Functionality
- [ ] Electron app runs cross-platform
- [ ] 3-panel UI (Navigator, Editor, Preview)
- [ ] Save/load .vellum JSON files
- [ ] Auto-save functionality
- [ ] Dark theme support

### Import/Export
- [ ] Import DOCX with chapter detection
- [ ] EPUB 3 generation with TOC and metadata
- [ ] Print PDF with 6+ trim sizes (5x8, 5.5x8.5, 6x9, etc.)
- [ ] Page numbers and headers/footers in PDF
- [ ] Cover image support

### Element Types (Front Matter)
- [ ] Title Page
- [ ] Copyright
- [ ] Dedication
- [ ] Epigraph
- [ ] Table of Contents
- [ ] Foreword
- [ ] Introduction
- [ ] Preface
- [ ] Prologue

### Element Types (Content & Back Matter)
- [ ] Chapter
- [ ] Epilogue
- [ ] Afterword
- [ ] Acknowledgments
- [ ] About the Author
- [ ] Also By
- [ ] Bibliography
- [ ] Endnotes

### Rich Text Features
- [ ] Bold, italic formatting
- [ ] Headings (H1-H6)
- [ ] Subheads
- [ ] Scene breaks
- [ ] Ornamental breaks
- [ ] Block quotations
- [ ] Verse/poetry formatting
- [ ] Lists (ordered/unordered)
- [ ] Inline images
- [ ] Web links
- [ ] Footnotes
- [ ] Endnotes

### Styles
- [ ] 12+ built-in book styles
- [ ] Style categories (Serif, Sans Serif, Script, Modern)
- [ ] Style browser with preview
- [ ] Configurable: heading, first paragraph, drop caps, ornamental breaks, body font
- [ ] Save custom style configurations

### Preview
- [ ] Live preview updates on edit
- [ ] Ebook mode (phone/tablet views)
- [ ] Print mode (page spread)
- [ ] Page-turn navigation

### Element Management
- [ ] Add/delete elements
- [ ] Reorder via drag-and-drop
- [ ] Merge chapters
- [ ] Split chapters
- [ ] Duplicate elements

### Polish
- [ ] Keyboard shortcuts
- [ ] Undo/redo
- [ ] Word count display
- [ ] Professional UI design
- [ ] Error handling

## Success Criteria

The app is complete when:
1. All checkboxes above are checked
2. `npm install && npm start` works without errors
3. Can import a real DOCX file
4. Can organize and edit content
5. Can apply different book styles
6. Can preview in multiple modes
7. Can export valid EPUB 3
8. Can export print-ready PDF
9. UI is beautiful and professional
10. All features work smoothly

## Development Guidelines

- Commit after each logical unit of work
- Push to origin main every few major features
- Write clean, modular, well-structured code
- No TODOs - fix issues immediately
- Test features as they're built
- Keep UI professional and polished
