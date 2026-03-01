import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  file: {
    showSaveDialog: () => ipcRenderer.invoke('file:show-save-dialog'),
    showOpenDialog: () => ipcRenderer.invoke('file:show-open-dialog'),
    showImportDialog: () => ipcRenderer.invoke('file:show-import-dialog'),
    save: (filePath: string, data: any) => ipcRenderer.invoke('file:save', filePath, data),
    load: (filePath: string) => ipcRenderer.invoke('file:load', filePath),
  },

  // Import operations
  import: {
    docx: (filePath: string) => ipcRenderer.invoke('import:docx', filePath),
  },

  // Export operations
  export: {
    epub: (projectData: any, settings: any) =>
      ipcRenderer.invoke('export:epub', projectData, settings),
    pdf: (projectData: any, settings: any) =>
      ipcRenderer.invoke('export:pdf', projectData, settings),
  },

  // Menu event listeners
  onMenuEvent: (callback: (event: string, ...args: any[]) => void) => {
    const channels = [
      'menu:new-project',
      'menu:open-project',
      'menu:save',
      'menu:save-as',
      'menu:import-docx',
      'menu:format-bold',
      'menu:format-italic',
      'menu:format-heading',
      'menu:generate-epub',
      'menu:generate-pdf',
      'menu:generate-all',
    ];

    channels.forEach(channel => {
      ipcRenderer.on(channel, (_event, ...args) => callback(channel, ...args));
    });

    // Return cleanup function
    return () => {
      channels.forEach(channel => {
        ipcRenderer.removeAllListeners(channel);
      });
    };
  },
});

// Type definitions for TypeScript
export interface ElectronAPI {
  file: {
    showSaveDialog: () => Promise<string | null>;
    showOpenDialog: () => Promise<string | null>;
    showImportDialog: () => Promise<string | null>;
    save: (filePath: string, data: any) => Promise<{ success: boolean; error?: string }>;
    load: (filePath: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  };
  import: {
    docx: (filePath: string) => Promise<{ success: boolean; html?: string; messages?: any[]; error?: string }>;
  };
  export: {
    epub: (projectData: any, settings: any) => Promise<{ success: boolean; message?: string; error?: string }>;
    pdf: (projectData: any, settings: any) => Promise<{ success: boolean; message?: string; error?: string }>;
  };
  onMenuEvent: (callback: (event: string, ...args: any[]) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
