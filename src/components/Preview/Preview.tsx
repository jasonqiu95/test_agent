import { useState, useMemo, useEffect, useCallback } from 'react';
import { useProjectStore } from '../../stores/project-store';
import { useBookStyle } from '../../hooks/useBookStyle';
import { PreviewRenderer } from './PreviewRenderer';

type PreviewDevice = 'iphone' | 'ipad' | 'kindle' | 'print';

interface DeviceConfig {
  width: number;
  height: number;
  label: string;
  icon: string;
}

const DEVICE_CONFIGS: Record<PreviewDevice, DeviceConfig> = {
  iphone: { width: 375, height: 667, label: 'iPhone', icon: '📱' },
  ipad: { width: 768, height: 1024, label: 'iPad', icon: '📱' },
  kindle: { width: 600, height: 800, label: 'Kindle', icon: '📖' },
  print: { width: 432, height: 648, label: 'Print (6×9")', icon: '📄' },
};

export function Preview() {
  const [device, setDevice] = useState<PreviewDevice>('ipad');
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPageSpread, setShowPageSpread] = useState(false);
  const { project, currentElementId } = useProjectStore();

  useBookStyle();

  const deviceConfig = DEVICE_CONFIGS[device];

  const currentElement = useMemo(() => {
    if (!project || !currentElementId) return null;
    return project.elements.find(el => el.id === currentElementId) || null;
  }, [project, currentElementId]);

  // Calculate total pages for print mode
  const totalPages = useMemo(() => {
    if (device !== 'print') return 0;
    if (!currentElement) return 0;
    // Rough estimate: 250 words per page
    const text = JSON.stringify(currentElement.content);
    const words = text.match(/\b\w+\b/g);
    const wordCount = words ? words.length : 0;
    return Math.max(1, Math.ceil(wordCount / 250));
  }, [device, currentElement]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(200, prev + 10));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(50, prev - 10));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(0, prev - (showPageSpread ? 2 : 1)));
  }, [showPageSpread]);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + (showPageSpread ? 2 : 1)));
  }, [totalPages, showPageSpread]);

  // Reset page when changing device or element
  useEffect(() => {
    setCurrentPage(0);
  }, [device, currentElementId]);

  const displayWidth = deviceConfig.width * (zoom / 100);
  const displayHeight = deviceConfig.height * (zoom / 100);

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
        {/* Device selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mr-1">Device:</span>
          {(Object.keys(DEVICE_CONFIGS) as PreviewDevice[]).map(dev => (
            <button
              key={dev}
              onClick={() => setDevice(dev)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                device === dev
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              title={DEVICE_CONFIGS[dev].label}
            >
              {DEVICE_CONFIGS[dev].icon} {DEVICE_CONFIGS[dev].label}
            </button>
          ))}
        </div>

        {/* Zoom controls and options */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mr-1">Zoom:</span>
          <button
            onClick={handleZoomOut}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
            disabled={zoom <= 50}
          >
            −
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors min-w-[60px]"
          >
            {zoom}%
          </button>
          <button
            onClick={handleZoomIn}
            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
            disabled={zoom >= 200}
          >
            +
          </button>

          {device === 'print' && (
            <>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPageSpread}
                  onChange={e => setShowPageSpread(e.target.checked)}
                  className="w-3 h-3 text-primary-600 rounded"
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">Page Spread</span>
              </label>
            </>
          )}

          <div className="flex-1" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {deviceConfig.width} × {deviceConfig.height}px
          </span>
        </div>
      </div>

      {/* Preview viewport */}
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        {currentElement ? (
          <div className="flex gap-4">
            {showPageSpread && device === 'print' && currentPage > 0 && (
              <PreviewRenderer
                element={currentElement}
                device={device}
                width={displayWidth}
                height={displayHeight}
                page={currentPage - 1}
                styleConfig={project?.styleConfig}
              />
            )}
            <PreviewRenderer
              element={currentElement}
              device={device}
              width={displayWidth}
              height={displayHeight}
              page={device === 'print' ? currentPage : undefined}
              styleConfig={project?.styleConfig}
            />
            {showPageSpread && device === 'print' && currentPage < totalPages - 1 && (
              <PreviewRenderer
                element={currentElement}
                device={device}
                width={displayWidth}
                height={displayHeight}
                page={currentPage + 1}
                styleConfig={project?.styleConfig}
              />
            )}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            Select an element to preview
          </div>
        )}
      </div>

      {/* Page navigation (for print mode) */}
      {device === 'print' && currentElement && (
        <div className="flex items-center justify-center gap-3 p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
