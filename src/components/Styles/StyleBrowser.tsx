import { useState } from 'react';
import { BookStyle } from '../../models/Book';
import { BOOK_STYLES } from '../../data/book-styles';
import { useProjectStore } from '../../stores/project-store';

interface StyleBrowserProps {
  onStyleSelect?: (styleId: string) => void;
}

export function StyleBrowser({ onStyleSelect }: StyleBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<BookStyle['category'] | 'all'>('all');
  const { project, updateStyleConfig } = useProjectStore();

  const categories: Array<{ value: BookStyle['category'] | 'all'; label: string }> = [
    { value: 'all', label: 'All Styles' },
    { value: 'serif', label: 'Serif' },
    { value: 'sans-serif', label: 'Sans Serif' },
    { value: 'script', label: 'Script' },
    { value: 'modern', label: 'Modern' },
  ];

  const filteredStyles =
    selectedCategory === 'all'
      ? BOOK_STYLES
      : BOOK_STYLES.filter(style => style.category === selectedCategory);

  const currentStyleId = project?.styleConfig.selectedStyleId;

  const handleSelectStyle = (styleId: string) => {
    updateStyleConfig({ selectedStyleId: styleId });
    onStyleSelect?.(styleId);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Category filter */}
      <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              selectedCategory === cat.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Style grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredStyles.map(style => (
            <StyleCard
              key={style.id}
              style={style}
              isSelected={style.id === currentStyleId}
              onSelect={() => handleSelectStyle(style.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface StyleCardProps {
  style: BookStyle;
  isSelected: boolean;
  onSelect: () => void;
}

function StyleCard({ style, isSelected, onSelect }: StyleCardProps) {
  return (
    <button
      onClick={onSelect}
      className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
        isSelected
          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {/* Style name and description */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-base text-gray-900 dark:text-white">{style.name}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              style.category === 'serif'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                : style.category === 'sans-serif'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : style.category === 'script'
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
            }`}
          >
            {style.category}
          </span>
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">{style.description}</p>
      </div>

      {/* Live preview */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 border border-gray-200 dark:border-gray-700">
        {/* Heading preview */}
        <div
          className="mb-3"
          style={{
            fontFamily: style.heading.fontFamily,
            fontSize: `${Math.min(style.heading.fontSize * 0.5, 18)}px`,
            fontWeight: style.heading.fontWeight,
            textAlign: style.heading.textAlign,
            textTransform: style.heading.textTransform,
            letterSpacing: `${style.heading.letterSpacing * 0.5}px`,
            color: style.heading.color,
          }}
        >
          Chapter Heading
        </div>

        {/* Body text preview */}
        <div
          style={{
            fontFamily: style.body.fontFamily,
            fontSize: `${Math.min(style.body.fontSize * 0.75, 12)}px`,
            lineHeight: style.body.lineHeight,
            textAlign: style.body.textAlign,
          }}
        >
          <p className="mb-2" style={{ textIndent: style.body.firstLineIndent > 0 ? '16px' : '0' }}>
            It was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin
            nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors.
          </p>
          <p style={{ textIndent: style.body.firstLineIndent > 0 ? '16px' : '0' }}>
            The hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large
            for indoor display, had been tacked to the wall.
          </p>
        </div>

        {/* Ornamental break preview */}
        {style.ornamentalBreak.symbol && (
          <div
            className="my-3"
            style={{
              textAlign: 'center',
              fontSize: `${Math.min(style.ornamentalBreak.fontSize * 0.75, 12)}px`,
              color: style.ornamentalBreak.color,
            }}
          >
            {style.ornamentalBreak.symbol}
          </div>
        )}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="mt-3 text-xs text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Currently Selected
        </div>
      )}
    </button>
  );
}
