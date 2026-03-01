import { useState } from 'react';

type PreviewMode = 'phone' | 'tablet' | 'print';

export function Preview() {
  const [mode, setMode] = useState<PreviewMode>('tablet');

  const getPreviewDimensions = () => {
    switch (mode) {
      case 'phone':
        return { width: 375, height: 667, label: 'iPhone' };
      case 'tablet':
        return { width: 768, height: 1024, label: 'iPad' };
      case 'print':
        return { width: 600, height: 900, label: 'Print (6×9")' };
    }
  };

  const dimensions = getPreviewDimensions();

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Preview mode selector */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
          Preview:
        </span>
        <button
          onClick={() => setMode('phone')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            mode === 'phone'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          📱 Phone
        </button>
        <button
          onClick={() => setMode('tablet')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            mode === 'tablet'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          📱 Tablet
        </button>
        <button
          onClick={() => setMode('print')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            mode === 'print'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          📄 Print
        </button>
        <div className="flex-1" />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {dimensions.label}
        </span>
      </div>

      {/* Preview viewport */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
        <div
          className="bg-white dark:bg-gray-800 shadow-2xl overflow-auto"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white font-serif">
              Chapter 1
            </h1>
            <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-4 font-serif">
              This is the live preview. It will update automatically as you edit the
              content in the editor panel.
            </p>
            <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-4 font-serif">
              The preview shows how your book will appear in different formats:
              ebook on phone, ebook on tablet, or print layout.
            </p>
            <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed mb-4 font-serif">
              Styles will be applied here, giving you an accurate representation
              of the final output.
            </p>
          </div>
        </div>
      </div>

      {/* Page navigation (for print mode) */}
      {mode === 'print' && (
        <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
          <button className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors">
            ← Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page 1 of 3
          </span>
          <button className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
