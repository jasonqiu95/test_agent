import { useState } from 'react';
import { BookElement } from '../../models/Book';
import { getElementTypeName } from '../../models/Book';

interface ImportDialogProps {
  elements: BookElement[];
  warnings: string[];
  onConfirm: (elements: BookElement[]) => void;
  onCancel: () => void;
}

export function ImportDialog({ elements, warnings, onConfirm, onCancel }: ImportDialogProps) {
  const [selectedElements, setSelectedElements] = useState<Set<string>>(
    new Set(elements.map(el => el.id))
  );

  const toggleElement = (id: string) => {
    const newSet = new Set(selectedElements);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedElements(newSet);
  };

  const handleConfirm = () => {
    const filteredElements = elements.filter(el => selectedElements.has(el.id));
    onConfirm(filteredElements);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Import Word Document
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Review the detected chapters below. Uncheck any you don't want to import.
          </p>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            {warnings.map((warning, index) => (
              <div key={index} className="flex items-start gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {warning}
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Detected Elements ({elements.length})
              </h3>
              <button
                onClick={() => {
                  if (selectedElements.size === elements.length) {
                    setSelectedElements(new Set());
                  } else {
                    setSelectedElements(new Set(elements.map(el => el.id)));
                  }
                }}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {selectedElements.size === elements.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {elements.map((element, index) => (
              <label
                key={element.id}
                className="flex items-start gap-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedElements.has(element.id)}
                  onChange={() => toggleElement(element.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {getElementTypeName(element.type)}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {element.title}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Element {index + 1} of {elements.length}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedElements.size === 0}
            className="px-4 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Import {selectedElements.size} Element{selectedElements.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
