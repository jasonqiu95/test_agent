import { app, BrowserWindow, Menu, dialog, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a1a',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'));
  }

  createMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Project',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:new-project'),
        },
        {
          label: 'Open Project...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow?.webContents.send('menu:open-project'),
        },
        { type: 'separator' },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow?.webContents.send('menu:save'),
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow?.webContents.send('menu:save-as'),
        },
        { type: 'separator' },
        {
          label: 'Import Word Document...',
          click: () => mainWindow?.webContents.send('menu:import-docx'),
        },
        { type: 'separator' },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          role: 'close',
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Select All', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },
    {
      label: 'Format',
      submenu: [
        {
          label: 'Bold',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow?.webContents.send('menu:format-bold'),
        },
        {
          label: 'Italic',
          accelerator: 'CmdOrCtrl+I',
          click: () => mainWindow?.webContents.send('menu:format-italic'),
        },
        { type: 'separator' },
        {
          label: 'Heading 1',
          accelerator: 'CmdOrCtrl+Alt+1',
          click: () => mainWindow?.webContents.send('menu:format-heading', 1),
        },
        {
          label: 'Heading 2',
          accelerator: 'CmdOrCtrl+Alt+2',
          click: () => mainWindow?.webContents.send('menu:format-heading', 2),
        },
      ],
    },
    {
      label: 'Generate',
      submenu: [
        {
          label: 'Generate EPUB...',
          click: () => mainWindow?.webContents.send('menu:generate-epub'),
        },
        {
          label: 'Generate PDF...',
          click: () => mainWindow?.webContents.send('menu:generate-pdf'),
        },
        { type: 'separator' },
        {
          label: 'Generate All Formats...',
          click: () => mainWindow?.webContents.send('menu:generate-all'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Toggle Developer Tools', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC Handlers

// File operations
ipcMain.handle('file:show-save-dialog', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Project',
    defaultPath: 'Untitled.vellum',
    filters: [{ name: 'Vellum Project', extensions: ['vellum'] }],
  });
  return result.canceled ? null : result.filePath;
});

ipcMain.handle('file:show-open-dialog', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Open Project',
    filters: [{ name: 'Vellum Project', extensions: ['vellum'] }],
    properties: ['openFile'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('file:save', async (_event, filePath: string, data: any) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('file:load', async (_event, filePath: string) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, data: JSON.parse(content) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// DOCX import
ipcMain.handle('file:show-import-dialog', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Word Document',
    filters: [{ name: 'Word Documents', extensions: ['docx'] }],
    properties: ['openFile'],
  });
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle('import:docx', async (_event, filePath: string) => {
  try {
    const mammoth = require('mammoth');
    const buffer = await fs.readFile(filePath);
    const result = await mammoth.convertToHtml({ buffer });
    return { success: true, html: result.value, messages: result.messages };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Save arbitrary file
ipcMain.handle('file:save-file', async (_event, fileName: string, buffer: ArrayBuffer) => {
  if (!mainWindow) return { success: false, error: 'No window' };

  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save File',
      defaultPath: fileName,
      filters: [
        { name: 'EPUB', extensions: ['epub'] },
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || !result.filePath) {
      return { success: false, error: 'User cancelled' };
    }

    await fs.writeFile(result.filePath, Buffer.from(buffer));
    return { success: true, filePath: result.filePath };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// PDF generation in main process
ipcMain.handle('export:generate-pdf', async (_event, projectData: any) => {
  if (!mainWindow) return { success: false, error: 'No window' };

  try {
    const PDFDocument = require('pdfkit');

    // Show save dialog
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Save PDF',
      defaultPath: `${projectData.metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }],
    });

    if (result.canceled || !result.filePath) {
      return { success: false, error: 'User cancelled' };
    }

    // Create PDF
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
    });

    // Pipe to file
    const writeStream = require('fs').createWriteStream(result.filePath);
    doc.pipe(writeStream);

    // Add content
    doc.fontSize(24).text(projectData.metadata.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`By ${projectData.metadata.author}`, { align: 'center' });
    doc.moveDown(2);

    // Add elements
    for (const element of projectData.elements) {
      doc.addPage();
      doc.fontSize(18).text(element.title);
      doc.moveDown();
      doc.fontSize(12);

      // Simple text extraction from ProseMirror content
      const text = extractTextFromProseMirror(element.content);
      doc.text(text);
    }

    doc.end();

    // Wait for write to complete
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('PDF generation error:', error);
    return { success: false, error: (error as Error).message };
  }
});

// Helper function to extract text from ProseMirror JSON
function extractTextFromProseMirror(doc: any): string {
  if (!doc || !doc.content) return '';

  const extractNode = (node: any): string => {
    if (node.type === 'text') {
      return node.text || '';
    }
    if (node.content) {
      return node.content.map(extractNode).join(' ');
    }
    return '';
  };

  return extractNode(doc);
}

// Export operations
ipcMain.handle('export:epub', async (_event, projectData: any, settings: any) => {
  return { success: true, message: 'Use EPUB builder in renderer' };
});

ipcMain.handle('export:pdf', async (_event, projectData: any, settings: any) => {
  return { success: true, message: 'Use PDF builder in main process' };
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
