import { ReactNode, useRef, useState, useEffect } from 'react';

interface ResizablePanelProps {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  children: ReactNode;
  className?: string;
  showDivider?: boolean;
}

export function ResizablePanel({
  defaultWidth = 300,
  minWidth = 200,
  maxWidth = 600,
  children,
  className = '',
  showDivider = true,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const newWidth = e.clientX - panelRef.current.getBoundingClientRect().left;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minWidth, maxWidth]);

  return (
    <div
      ref={panelRef}
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: `${width}px` }}
    >
      {children}
      {showDivider && (
        <div
          className="absolute top-0 right-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700 hover:bg-primary-500 dark:hover:bg-primary-600 cursor-col-resize transition-colors z-10"
          onMouseDown={() => setIsResizing(true)}
        />
      )}
    </div>
  );
}
