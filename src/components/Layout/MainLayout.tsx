import { useState } from 'react';
import { ResizablePanel } from './ResizablePanel';
import { Navigator } from '../Navigator/Navigator';
import { Editor } from '../Editor/Editor';
import { Preview } from '../Preview/Preview';
import { ImportDialog } from '../Dialogs/ImportDialog';
import { useProjectStore } from '../../stores/project-store';
import { useFileOperations } from '../../hooks/useFileOperations';
import { importDocx } from '../../services/docx-importer/DocxImporter';
import { BookElement } from '../../models/Book';

export function MainLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [importData, setImportData] = useState<{ elements: BookElement[]; warnings: string[] } | null>(null);
  const { project } = useProjectStore();
  const { saveProject, openProject, hasUnsavedChanges } = useFileOperations();
  const projectStore = useProjectStore();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleImportDocx = async () => {
    try {
      const filePath = await window.electronAPI.file.showImportDialog();
      if (!filePath) return; // User cancelled

      const result = await importDocx(filePath);
      setImportData(result);
    } catch (error) {
      console.error('Import error:', error);
      alert(`Failed to import: ${(error as Error).message}`);
    }
  };

  const handleConfirmImport = (elements: BookElement[]) => {
    // Add imported elements to the project
    elements.forEach(element => {
      projectStore.addElement(element.type);
      // Update the newly added element with imported data
      const addedElement = projectStore.project?.elements[projectStore.project.elements.length - 1];
      if (addedElement) {
        projectStore.updateElement(addedElement.id, {
          title: element.title,
          content: element.content,
        });
      }
    });
    setImportData(null);
  };

  const projectName = project?.metadata.title || 'Untitled Project';
  const fileName = project?.filePath ? project.filePath.split('/').pop()?.replace('.vellum', '') : projectName;

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Top bar */}
      <div className="h-14 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Vellum Clone
          </h1>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded flex items-center gap-2">
            {fileName}
            {hasUnsavedChanges && (
              <span className="w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes" />
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => openProject()}
            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Open
          </button>
          <button
            onClick={handleImportDocx}
            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Import DOCX
          </button>
          <button
            onClick={() => saveProject()}
            className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Save
          </button>
          <button className="px-3 py-1.5 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors">
            Generate
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Navigator */}
        <ResizablePanel
          defaultWidth={280}
          minWidth={200}
          maxWidth={400}
          className="border-r border-gray-200 dark:border-gray-700"
        >
          <Navigator />
        </ResizablePanel>

        {/* Center panel - Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <Editor />
        </div>

        {/* Right panel - Preview */}
        <ResizablePanel
          defaultWidth={400}
          minWidth={300}
          maxWidth={600}
          showDivider={false}
          className="border-l border-gray-200 dark:border-gray-700"
        >
          <Preview />
        </ResizablePanel>
      </div>

      {/* Import Dialog */}
      {importData && (
        <ImportDialog
          elements={importData.elements}
          warnings={importData.warnings}
          onConfirm={handleConfirmImport}
          onCancel={() => setImportData(null)}
        />
      )}
    </div>
  );
}
