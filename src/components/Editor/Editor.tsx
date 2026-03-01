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

  const stats = useMemo(() => {
    if (!currentElement?.content) return { words: 0, characters: 0, readingTime: 0 };

    const extractText = (node: any): string => {
      if (node.type === 'text') return node.text || '';
      if (node.content) return node.content.map(extractText).join(' ');
      return '';
    };

    const text = extractText(currentElement.content);
    const words = text.match(/\b\w+\b/g);
    const wordCount = words ? words.length : 0;
    const charCount = text.length;
    const readingTime = Math.ceil(wordCount / 200); // ~200 words per minute

    return { words: wordCount, characters: charCount, readingTime };
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
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <ToolbarButton title="Bold (Cmd+B)" icon="B" onClick={() => {}} />
        <ToolbarButton title="Italic (Cmd+I)" icon="I" onClick={() => {}} />
        <ToolbarButton title="Underline (Cmd+U)" icon="U" onClick={() => {}} />
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        <ToolbarButton title="Heading 1" icon="H1" onClick={() => {}} />
        <ToolbarButton title="Heading 2" icon="H2" onClick={() => {}} />
        <ToolbarButton title="Heading 3" icon="H3" onClick={() => {}} />
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        <ToolbarButton title="Blockquote" icon="❝❞" onClick={() => {}} />
        <ToolbarButton title="Scene Break" icon="***" onClick={() => {}} />
        <ToolbarButton title="Link" icon="🔗" onClick={() => {}} />
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

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <span className="font-medium">{stats.words.toLocaleString()}</span>
          <span>words</span>
        </div>
        <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
        <div className="flex items-center gap-1">
          <span className="font-medium">{stats.characters.toLocaleString()}</span>
          <span>characters</span>
        </div>
        <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
        <div className="flex items-center gap-1">
          <span className="font-medium">~{stats.readingTime}</span>
          <span>min read</span>
        </div>
        <div className="flex-1" />
        <div className="text-gray-500 dark:text-gray-500">
          {currentElement.type === 'chapter' ? 'Chapter' : currentElement.title}
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
