import { useEffect, useCallback } from 'react';
import { useProjectStore } from '../stores/project-store';

export function useFileOperations() {
  const { project, markSaved, loadProject, setFilePath, hasUnsavedChanges } = useProjectStore();

  // Save project to file
  const saveProject = useCallback(async (filePath?: string) => {
    if (!project) return;

    try {
      let targetPath: string | undefined | null = filePath || project.filePath;

      // If no path, show save dialog
      if (!targetPath) {
        targetPath = await window.electronAPI.file.showSaveDialog();
        if (!targetPath) return; // User cancelled
      }

      const result = await window.electronAPI.file.save(targetPath, project);
      if (result.success) {
        setFilePath(targetPath);
        markSaved();
        return true;
      } else {
        console.error('Failed to save:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Save error:', error);
      return false;
    }
  }, [project, setFilePath, markSaved]);

  // Save As - always show dialog
  const saveAsProject = useCallback(async () => {
    if (!project) return;

    try {
      const filePath = await window.electronAPI.file.showSaveDialog();
      if (!filePath) return; // User cancelled

      const result = await window.electronAPI.file.save(filePath, project);
      if (result.success) {
        setFilePath(filePath);
        markSaved();
        return true;
      } else {
        console.error('Failed to save:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Save As error:', error);
      return false;
    }
  }, [project, setFilePath, markSaved]);

  // Open project from file
  const openProject = useCallback(async () => {
    try {
      const filePath = await window.electronAPI.file.showOpenDialog();
      if (!filePath) return; // User cancelled

      const result = await window.electronAPI.file.load(filePath);
      if (result.success && result.data) {
        loadProject(result.data);
        setFilePath(filePath);
        return true;
      } else {
        console.error('Failed to load:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Open error:', error);
      return false;
    }
  }, [loadProject, setFilePath]);

  // Auto-save every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges || !project?.filePath) return;

    const interval = setInterval(() => {
      saveProject();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, project?.filePath, saveProject]);

  // Listen for menu events from Electron
  useEffect(() => {
    const cleanup = window.electronAPI.onMenuEvent((event) => {
      switch (event) {
        case 'menu:save':
          saveProject();
          break;
        case 'menu:save-as':
          saveAsProject();
          break;
        case 'menu:open-project':
          openProject();
          break;
        case 'menu:new-project':
          // Will be implemented with confirmation dialog if unsaved changes
          break;
      }
    });

    return cleanup;
  }, [saveProject, saveAsProject, openProject]);

  return {
    saveProject,
    saveAsProject,
    openProject,
    hasUnsavedChanges,
  };
}
