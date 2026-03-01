import { useState } from 'react';
import { useProjectStore } from '../../stores/project-store';
import { generateEpub } from '../../services/epub-builder/EpubBuilder';

interface GenerateDialogProps {
  onClose: () => void;
}

type GenerateFormat = 'epub' | 'pdf';

export function GenerateDialog({ onClose }: GenerateDialogProps) {
  const [format, setFormat] = useState<GenerateFormat>('epub');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { project } = useProjectStore();

  const handleGenerate = async () => {
    if (!project) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      if (format === 'epub') {
        const blob = await generateEpub(project);

        // Save file
        const fileName = `${project.metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
        const result = await window.electronAPI.file.saveFile(fileName, await blob.arrayBuffer());

        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            onClose();
          }, 2000);
        } else if (result.error) {
          setError(result.error);
        }
      } else {
        // PDF generation will be implemented in Phase 11
        setError('PDF generation coming soon!');
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to generate file');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Generate Book</h2>

        {/* Format selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Output Format
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setFormat('epub')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                format === 'epub'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">📱</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">EPUB 3</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">eBook format</div>
            </button>
            <button
              onClick={() => setFormat('pdf')}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                format === 'pdf'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <div className="text-2xl mb-1">📄</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">PDF</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Print-ready</div>
            </button>
          </div>
        </div>

        {/* Book info */}
        {project && (
          <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {project.metadata.title}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              By {project.metadata.author}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {project.elements.length} elements • {project.elements.filter(el => el.type === 'chapter').length} chapters
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✓ File generated successfully!
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !project}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
