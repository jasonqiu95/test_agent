import { useMemo } from 'react';
import { useProjectStore } from '../../stores/project-store';
import { ProseMirrorEditor } from './ProseMirrorEditor';
import { useBookStyle } from '../../hooks/useBookStyle';

export function Editor() {
  const { project, currentElementId, updateElement } = useProjectStore();
  useBookStyle();

  const currentElement = useMemo(() => {
    if (!project || !currentElementId) return null;
    return project.elements.find(el => el.id === currentElementId) || null;
  }, [project, currentElementId]);

  const handleContentChange = (content: any) => {
    if (currentElementId) {
      updateElement(currentElementId, { content });
    }
  };

  const wordCount = useMemo(() => {
    if (!currentElement?.content) return 0;
    const text = JSON.stringify(currentElement.content);
    const words = text.match(/\b\w+\b/g);
    return words ? words.length : 0;
  }, [currentElement]);

  if (!currentElement) {
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          Select an element to edit
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="toolbar border-b border-gray-200 dark:border-gray-700">
        <ToolbarButton title="Bold (Cmd+B)" icon="B" onClick={() => {}} />
        <ToolbarButton title="Italic (Cmd+I)" icon="I" onClick={() => {}} />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
        <ToolbarButton title="Heading 1" icon="H1" onClick={() => {}} />
        <ToolbarButton title="Heading 2" icon="H2" onClick={() => {}} />
        <ToolbarButton title="Heading 3" icon="H3" onClick={() => {}} />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
        <ToolbarButton title="Blockquote" icon="❝❞" onClick={() => {}} />
        <ToolbarButton title="Scene Break" icon="***" onClick={() => {}} />
        <ToolbarButton title="Link" icon="🔗" onClick={() => {}} />
        <div className="flex-1" />
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {wordCount} words
        </div>
      </div>

      {/* Editor content area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-8 px-8">
          <div className="book-content">
            <ProseMirrorEditor
              content={currentElement.content}
              onChange={handleContentChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  title: string;
  icon: string;
  onClick: () => void;
}

function ToolbarButton({ title, icon, onClick }: ToolbarButtonProps) {
  return (
    <button
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
      title={title}
      onClick={onClick}
    >
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {icon}
      </span>
    </button>
  );
}
