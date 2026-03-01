import { useState } from 'react';

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
        {activeTab === 'contents' ? (
          <ContentsPanel />
        ) : (
          <StylesPanel />
        )}
      </div>
    </div>
  );
}

function ContentsPanel() {
  return (
    <div className="p-4">
      <div className="mb-4">
        <button className="w-full px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors font-medium">
          + Add Element
        </button>
      </div>
      <div className="space-y-1">
        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Front Matter
        </div>
        <ElementItem title="Title Page" selected={false} />
        <ElementItem title="Copyright" selected={false} />
        <ElementItem title="Dedication" selected={false} />
        <ElementItem title="Table of Contents" selected={false} />

        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 mt-4">
          Content
        </div>
        <ElementItem title="Chapter 1" selected={true} />
        <ElementItem title="Chapter 2" selected={false} />
        <ElementItem title="Chapter 3" selected={false} />

        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 mt-4">
          Back Matter
        </div>
        <ElementItem title="About the Author" selected={false} />
        <ElementItem title="Also By" selected={false} />
      </div>
    </div>
  );
}

function StylesPanel() {
  return (
    <div className="p-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Book styles will be displayed here
      </div>
    </div>
  );
}

interface ElementItemProps {
  title: string;
  selected: boolean;
}

function ElementItem({ title, selected }: ElementItemProps) {
  return (
    <div
      className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${
        selected
          ? 'bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
      }`}
    >
      <div className="text-sm font-medium">{title}</div>
    </div>
  );
}
