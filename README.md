# Vellum Clone - Professional Book Formatting Tool

A professional desktop application for formatting and publishing books, built with Electron, React, and TypeScript.

## Features

### Core Functionality
- **Rich Text Editor**: ProseMirror-based editor with full formatting support
- **Book Structure Management**: Organize your book with chapters, parts, front matter, and back matter
- **Live Preview**: See your book in different formats (iPhone, iPad, Kindle, Print)
- **Multiple Export Formats**: Generate EPUB 3 and PDF files

### Styling System
- **12 Professional Book Styles**: 4 Serif, 4 Sans Serif, 2 Script, and 2 Modern styles
- **Customizable Typography**: Adjust fonts, sizes, spacing, and more
- **Live Style Preview**: See changes in real-time as you customize

### Import & Export
- **DOCX Import**: Import Microsoft Word documents with automatic chapter detection
- **EPUB 3 Generation**: Create industry-standard eBooks with proper navigation
- **PDF Generation**: Print-ready PDFs with proper margins and page layout

### User Interface
- **Three-Panel Layout**: Navigator, Editor, and Preview panels
- **Dark Mode**: Full dark mode support
- **Responsive**: Resizable panels for comfortable editing
- **Status Bar**: Word count, character count, and reading time

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build the application
npm run build

# Start built application
npm start

# Package for distribution
npm run dist
```

## Development

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Project Structure
```
vellum-clone/
├── electron/          # Electron main process
│   ├── main.ts       # Main process entry
│   └── preload.ts    # Preload script
├── src/              # React renderer process
│   ├── components/   # React components
│   ├── models/       # TypeScript interfaces
│   ├── services/     # Business logic
│   ├── stores/       # Zustand state management
│   ├── hooks/        # Custom React hooks
│   └── data/         # Static data (book styles)
└── dist/             # Build output
```

### Key Technologies
- **Electron**: Desktop application framework
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Fast build tool
- **Tailwind CSS**: Utility-first CSS
- **ProseMirror**: Rich text editing
- **Zustand**: State management
- **JSZip**: EPUB generation
- **PDFKit**: PDF generation

## Usage

### Creating a New Book

1. Launch the application
2. The app starts with a default project
3. Use the Navigator panel to add/remove elements
4. Select an element to edit its content
5. Use the Preview panel to see how it looks

### Importing from Word

1. Click "Import DOCX" button
2. Select your Word document
3. Review detected chapters
4. Confirm import

### Applying Styles

1. Click the "Styles" tab in the Navigator
2. Browse available styles
3. Select a style to apply
4. Use "Customize" tab to fine-tune settings

### Generating Output Files

1. Click the "Generate" button
2. Choose EPUB or PDF format
3. Configure export settings
4. Save your file

### Keyboard Shortcuts

- `Cmd/Ctrl + N`: New Project
- `Cmd/Ctrl + O`: Open Project
- `Cmd/Ctrl + S`: Save Project
- `Cmd/Ctrl + Shift + S`: Save As
- `Cmd/Ctrl + B`: Bold
- `Cmd/Ctrl + I`: Italic
- `Cmd/Ctrl + Z`: Undo
- `Cmd/Ctrl + Shift + Z`: Redo

## Export Formats

### EPUB 3
- Industry-standard eBook format
- Compatible with all major eReaders
- Includes navigation and metadata
- Supports custom styles and fonts

### PDF
- Print-ready format
- Customizable trim sizes
- Professional page layout
- Proper margins for binding

## Troubleshooting

### Build Issues

If you encounter build errors:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Electron Issues

If the app doesn't start:
```bash
# Rebuild electron
npm rebuild electron
```

## Contributing

This is a clone/learning project inspired by Vellum. Contributions are welcome!

## License

MIT License - See LICENSE file for details

## Credits

Built with:
- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [ProseMirror](https://prosemirror.net/)
- [Tailwind CSS](https://tailwindcss.com/)
- And many other open-source libraries

Inspired by [Vellum](https://vellum.pub/), the professional book formatting software for macOS.
