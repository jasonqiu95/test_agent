export function Editor() {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="toolbar border-b border-gray-200 dark:border-gray-700">
        <ToolbarButton title="Bold" icon="B" />
        <ToolbarButton title="Italic" icon="I" />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
        <ToolbarButton title="Heading 1" icon="H1" />
        <ToolbarButton title="Heading 2" icon="H2" />
        <ToolbarButton title="Heading 3" icon="H3" />
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
        <ToolbarButton title="Blockquote" icon="❝❞" />
        <ToolbarButton title="List" icon="•" />
        <ToolbarButton title="Link" icon="🔗" />
        <div className="flex-1" />
        <div className="text-sm text-gray-500 dark:text-gray-400">
          1,234 words
        </div>
      </div>

      {/* Editor content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="prose dark:prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              Chapter 1
            </h1>
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              The rich text editor will be integrated here with ProseMirror in Phase 4.
              For now, this is a placeholder to demonstrate the layout.
            </p>
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              You'll be able to format text with bold, italic, headings, blockquotes,
              lists, links, images, and special features like scene breaks and ornamental
              breaks.
            </p>
            <h2 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">
              Subheading Example
            </h2>
            <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              This is what a typical chapter might look like. The editor will support
              all the rich text features needed for professional book formatting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  title: string;
  icon: string;
}

function ToolbarButton({ title, icon }: ToolbarButtonProps) {
  return (
    <button
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
      title={title}
    >
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        {icon}
      </span>
    </button>
  );
}
