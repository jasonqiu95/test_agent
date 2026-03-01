import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { BookProject, BookElement, ElementType, StyleConfig } from '../models/Book';
// Use built-in crypto for UUID generation

interface ProjectState {
  // Current project
  project: BookProject | null;
  currentElementId: string | null;
  hasUnsavedChanges: boolean;

  // History for undo/redo
  history: BookProject[];
  historyIndex: number;
  maxHistoryLength: number;

  // Actions
  createNewProject: () => void;
  loadProject: (project: BookProject) => void;
  setCurrentElement: (elementId: string | null) => void;

  // Element management
  addElement: (type: ElementType, insertAfterIndex?: number) => void;
  updateElement: (elementId: string, updates: Partial<BookElement>) => void;
  deleteElement: (elementId: string) => void;
  reorderElements: (oldIndex: number, newIndex: number) => void;
  duplicateElement: (elementId: string) => void;

  // Project metadata
  updateMetadata: (updates: Partial<BookProject['metadata']>) => void;
  updateStyleConfig: (updates: Partial<StyleConfig>) => void;
  updateExportSettings: (updates: Partial<BookProject['exportSettings']>) => void;

  // Save state management
  markSaved: () => void;
  setFilePath: (path: string) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

// Helper to create empty ProseMirror document
function createEmptyDocument() {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
  };
}

// Helper to create a new element
function createNewElement(type: ElementType, order: number): BookElement {
  const id = crypto.randomUUID();
  const title = type === 'chapter' ? `Chapter ${order + 1}` : type;

  return {
    id,
    type,
    title,
    order,
    content: createEmptyDocument(),
  };
}

// Helper to create a default project
function createDefaultProject(): BookProject {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    metadata: {
      title: 'Untitled Book',
      author: 'Author Name',
      language: 'en',
    },
    elements: [
      createNewElement('title-page', 0),
      createNewElement('copyright', 1),
      createNewElement('chapter', 2),
    ],
    styleConfig: {
      selectedStyleId: 'classic-serif',
      customizations: {},
    },
    exportSettings: {
      trimSize: '6x9',
      includePageNumbers: true,
      includeHeaders: true,
      includeFooters: false,
    },
    createdAt: now,
    updatedAt: now,
  };
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => {
    const defaultProject = createDefaultProject();
    return {
      project: defaultProject,
      currentElementId: defaultProject.elements[0]?.id || null,
      hasUnsavedChanges: false,
      history: [],
      historyIndex: -1,
      maxHistoryLength: 50,

    createNewProject: () => {
      const newProject = createDefaultProject();
      set(state => {
        state.project = newProject;
        state.currentElementId = newProject.elements[0]?.id || null;
        state.hasUnsavedChanges = false;
        state.history = [];
        state.historyIndex = -1;
      });
    },

    loadProject: (project) => {
      set(state => {
        state.project = project;
        state.currentElementId = project.elements[0]?.id || null;
        state.hasUnsavedChanges = false;
        state.history = [];
        state.historyIndex = -1;
      });
    },

    setCurrentElement: (elementId) => {
      set(state => {
        state.currentElementId = elementId;
      });
    },

    addElement: (type, insertAfterIndex) => {
      set(state => {
        if (!state.project) return;

        const elements = state.project.elements;
        const insertIndex = insertAfterIndex !== undefined ? insertAfterIndex + 1 : elements.length;

        const newElement = createNewElement(type, insertIndex);
        elements.splice(insertIndex, 0, newElement);

        // Reorder all elements
        elements.forEach((el, idx) => {
          el.order = idx;
        });

        state.project.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
        state.currentElementId = newElement.id;
      });
    },

    updateElement: (elementId, updates) => {
      set(state => {
        if (!state.project) return;

        const element = state.project.elements.find(el => el.id === elementId);
        if (element) {
          Object.assign(element, updates);
          state.project.updatedAt = new Date().toISOString();
          state.hasUnsavedChanges = true;
        }
      });
    },

    deleteElement: (elementId) => {
      set(state => {
        if (!state.project) return;

        const index = state.project.elements.findIndex(el => el.id === elementId);
        if (index !== -1) {
          state.project.elements.splice(index, 1);

          // Reorder remaining elements
          state.project.elements.forEach((el, idx) => {
            el.order = idx;
          });

          // Update current element if deleted
          if (state.currentElementId === elementId) {
            state.currentElementId = state.project.elements[0]?.id || null;
          }

          state.project.updatedAt = new Date().toISOString();
          state.hasUnsavedChanges = true;
        }
      });
    },

    reorderElements: (oldIndex, newIndex) => {
      set(state => {
        if (!state.project) return;

        const elements = state.project.elements;
        const [movedElement] = elements.splice(oldIndex, 1);
        elements.splice(newIndex, 0, movedElement);

        // Update order property
        elements.forEach((el, idx) => {
          el.order = idx;
        });

        state.project.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
      });
    },

    duplicateElement: (elementId) => {
      set(state => {
        if (!state.project) return;

        const element = state.project.elements.find(el => el.id === elementId);
        if (element) {
          const index = state.project.elements.indexOf(element);
          const duplicate: BookElement = {
            ...element,
            id: crypto.randomUUID(),
            title: `${element.title} (Copy)`,
            order: index + 1,
          };

          state.project.elements.splice(index + 1, 0, duplicate);

          // Reorder all elements
          state.project.elements.forEach((el, idx) => {
            el.order = idx;
          });

          state.project.updatedAt = new Date().toISOString();
          state.hasUnsavedChanges = true;
        }
      });
    },

    updateMetadata: (updates) => {
      set(state => {
        if (!state.project) return;

        Object.assign(state.project.metadata, updates);
        state.project.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
      });
    },

    updateStyleConfig: (updates) => {
      set(state => {
        if (!state.project) return;

        Object.assign(state.project.styleConfig, updates);
        state.project.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
      });
    },

    updateExportSettings: (updates) => {
      set(state => {
        if (!state.project) return;

        Object.assign(state.project.exportSettings, updates);
        state.project.updatedAt = new Date().toISOString();
        state.hasUnsavedChanges = true;
      });
    },

    markSaved: () => {
      set(state => {
        state.hasUnsavedChanges = false;
      });
    },

    setFilePath: (path) => {
      set(state => {
        if (state.project) {
          state.project.filePath = path;
        }
      });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        set(state => {
          state.historyIndex -= 1;
          state.project = history[state.historyIndex];
          state.hasUnsavedChanges = true;
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        set(state => {
          state.historyIndex += 1;
          state.project = history[state.historyIndex];
          state.hasUnsavedChanges = true;
        });
      }
    },

    canUndo: () => {
      const { historyIndex } = get();
      return historyIndex > 0;
    },

    canRedo: () => {
      const { history, historyIndex } = get();
      return historyIndex < history.length - 1;
    },
  };
  })
);
