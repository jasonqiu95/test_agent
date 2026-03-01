import { useState } from 'react';
import { useProjectStore } from '../../stores/project-store';
import { getElementTypeName, getElementCategory, ElementType } from '../../models/Book';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StyleBrowser } from '../Styles/StyleBrowser';
import { StyleCustomizer } from '../Styles/StyleCustomizer';

type NavigatorTab = 'contents' | 'styles';

export function Navigator() {
  const [activeTab, setActiveTab] = useState<NavigatorTab>('contents');

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-800">
      {/* Tab selector */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('contents')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'contents'
              ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Contents
        </button>
        <button
          onClick={() => setActiveTab('styles')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'styles'
              ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Styles
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'contents' ? <ContentsPanel /> : <StylesPanel />}
      </div>
    </div>
  );
}

function ContentsPanel() {
  const { project, currentElementId, setCurrentElement, reorderElements, addElement, deleteElement, duplicateElement } =
    useProjectStore();
  const [showAddMenu, setShowAddMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!project) return null;

  const { elements } = project;
  const frontMatter = elements.filter(el => getElementCategory(el.type) === 'front');
  const content = elements.filter(el => getElementCategory(el.type) === 'content');
  const backMatter = elements.filter(el => getElementCategory(el.type) === 'back');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = elements.findIndex(el => el.id === active.id);
      const newIndex = elements.findIndex(el => el.id === over.id);
      reorderElements(oldIndex, newIndex);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors font-medium"
        >
          + Add Element
        </button>

        {showAddMenu && (
          <div className="mt-2 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <AddElementMenu
              onSelect={type => {
                addElement(type);
                setShowAddMenu(false);
              }}
              onClose={() => setShowAddMenu(false)}
            />
          </div>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={elements.map(el => el.id)} strategy={verticalListSortingStrategy}>
          {frontMatter.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Front Matter
              </div>
              {frontMatter.map(element => (
                <SortableElement
                  key={element.id}
                  element={element}
                  selected={element.id === currentElementId}
                  onSelect={() => setCurrentElement(element.id)}
                  onDelete={() => deleteElement(element.id)}
                  onDuplicate={() => duplicateElement(element.id)}
                />
              ))}
            </div>
          )}

          {content.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Content
              </div>
              {content.map(element => (
                <SortableElement
                  key={element.id}
                  element={element}
                  selected={element.id === currentElementId}
                  onSelect={() => setCurrentElement(element.id)}
                  onDelete={() => deleteElement(element.id)}
                  onDuplicate={() => duplicateElement(element.id)}
                />
              ))}
            </div>
          )}

          {backMatter.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Back Matter
              </div>
              {backMatter.map(element => (
                <SortableElement
                  key={element.id}
                  element={element}
                  selected={element.id === currentElementId}
                  onSelect={() => setCurrentElement(element.id)}
                  onDelete={() => deleteElement(element.id)}
                  onDuplicate={() => duplicateElement(element.id)}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface SortableElementProps {
  element: any;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableElement({ element, selected, onSelect, onDelete, onDuplicate }: SortableElementProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: element.id });
  const [showMenu, setShowMenu] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        className={`px-3 py-2 rounded-md cursor-pointer transition-colors mb-1 flex items-center ${
          selected
            ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
        }`}
        onClick={onSelect}
      >
        <div {...attributes} {...listeners} className="mr-2 cursor-grab active:cursor-grabbing">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
        <div className="flex-1 text-sm font-medium">{element.title}</div>
        <button
          onClick={e => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      {showMenu && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10 min-w-[150px]">
          <button
            onClick={() => {
              onDuplicate();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
          >
            Duplicate
          </button>
          <button
            onClick={() => {
              onDelete();
              setShowMenu(false);
            }}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600 dark:text-red-400"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

interface AddElementMenuProps {
  onSelect: (type: ElementType) => void;
  onClose: () => void;
}

function AddElementMenu({ onSelect }: AddElementMenuProps) {
  const frontMatterTypes: ElementType[] = [
    'title-page',
    'half-title',
    'copyright',
    'dedication',
    'epigraph',
    'table-of-contents',
    'foreword',
    'introduction',
    'preface',
    'prologue',
  ];

  const contentTypes: ElementType[] = ['chapter', 'part', 'volume'];

  const backMatterTypes: ElementType[] = [
    'epilogue',
    'afterword',
    'endnotes',
    'bibliography',
    'acknowledgments',
    'about-author',
    'also-by',
  ];

  return (
    <div className="max-h-96 overflow-y-auto">
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-600">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Front Matter</div>
      </div>
      {frontMatterTypes.map(type => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
        >
          {getElementTypeName(type)}
        </button>
      ))}

      <div className="px-3 py-2 border-b border-t border-gray-200 dark:border-gray-600 mt-2">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Content</div>
      </div>
      {contentTypes.map(type => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
        >
          {getElementTypeName(type)}
        </button>
      ))}

      <div className="px-3 py-2 border-b border-t border-gray-200 dark:border-gray-600 mt-2">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Back Matter</div>
      </div>
      {backMatterTypes.map(type => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
        >
          {getElementTypeName(type)}
        </button>
      ))}
    </div>
  );
}

function StylesPanel() {
  const [view, setView] = useState<'browser' | 'customizer'>('browser');

  return (
    <div className="h-full flex flex-col">
      {/* View toggle */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setView('browser')}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            view === 'browser'
              ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Browse
        </button>
        <button
          onClick={() => setView('customizer')}
          className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
            view === 'customizer'
              ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
          }`}
        >
          Customize
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === 'browser' ? <StyleBrowser /> : <StyleCustomizer />}
      </div>
    </div>
  );
}
