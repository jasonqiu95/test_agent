import { useMemo, useEffect, useRef, useState } from 'react';
import { BookElement, StyleConfig } from '../../models/Book';
import { StyleEngine } from '../../services/style-engine/StyleEngine';

interface PreviewRendererProps {
  element: BookElement;
  device: 'iphone' | 'ipad' | 'kindle' | 'print';
  width: number;
  height: number;
  page?: number;
  styleConfig?: StyleConfig;
}

export function PreviewRenderer({
  element,
  device,
  width,
  height,
  page,
  styleConfig,
}: PreviewRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Generate HTML from ProseMirror JSON
  const contentHtml = useMemo(() => {
    return proseMirrorToHtml(element.content);
  }, [element.content]);

  // Apply styles when styleConfig changes
  useEffect(() => {
    if (containerRef.current && styleConfig) {
      const css = StyleEngine.generateCSS(styleConfig);
      let styleEl = containerRef.current.querySelector('#preview-style') as HTMLStyleElement;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'preview-style';
        containerRef.current.appendChild(styleEl);
      }
      styleEl.textContent = css;
    }
    setIsReady(true);
  }, [styleConfig]);

  const padding = device === 'print' ? 48 : device === 'kindle' ? 32 : 24;

  return (
    <div
      ref={containerRef}
      className="bg-white shadow-2xl overflow-auto relative"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      <div
        className="book-content h-full overflow-auto"
        style={{
          padding: `${padding}px`,
          opacity: isReady ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
      >
        {/* Element title (e.g., chapter heading) */}
        {element.title && element.type !== 'title-page' && (
          <h1 className="chapter-heading">{element.title}</h1>
        )}

        {/* Element content */}
        <div dangerouslySetInnerHTML={{ __html: contentHtml }} />

        {/* Page number for print */}
        {device === 'print' && page !== undefined && (
          <div
            className="absolute bottom-4 text-xs text-gray-500"
            style={{
              left: page % 2 === 0 ? `${padding}px` : 'auto',
              right: page % 2 === 1 ? `${padding}px` : 'auto',
            }}
          >
            {page + 1}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Convert ProseMirror JSON to HTML for preview
 */
function proseMirrorToHtml(doc: any): string {
  if (!doc || !doc.content) {
    return '<p></p>';
  }

  const renderNode = (node: any): string => {
    const type = node.type;
    const content = node.content ? node.content.map(renderNode).join('') : '';
    const marks = node.marks || [];

    let html = '';

    switch (type) {
      case 'doc':
        return content;

      case 'paragraph':
        html = `<p>${content || '<br>'}</p>`;
        break;

      case 'heading':
        const level = node.attrs?.level || 1;
        html = `<h${level}>${content}</h${level}>`;
        break;

      case 'blockquote':
        html = `<blockquote>${content}</blockquote>`;
        break;

      case 'code_block':
        html = `<pre><code>${escapeHtml(content)}</code></pre>`;
        break;

      case 'bullet_list':
        html = `<ul>${content}</ul>`;
        break;

      case 'ordered_list':
        html = `<ol>${content}</ol>`;
        break;

      case 'list_item':
        html = `<li>${content}</li>`;
        break;

      case 'horizontal_rule':
        html = '<hr>';
        break;

      case 'hard_break':
        html = '<br>';
        break;

      case 'scene_break':
        html = '<div class="ornamental-break"></div>';
        break;

      case 'ornamental_break':
        html = `<div class="ornamental-break">${node.attrs?.symbol || '✦'}</div>`;
        break;

      case 'verse':
        html = `<div class="verse">${content}</div>`;
        break;

      case 'text':
        html = escapeHtml(node.text || '');
        // Apply marks
        for (const mark of marks) {
          switch (mark.type) {
            case 'strong':
              html = `<strong>${html}</strong>`;
              break;
            case 'em':
              html = `<em>${html}</em>`;
              break;
            case 'code':
              html = `<code>${html}</code>`;
              break;
            case 'link':
              html = `<a href="${escapeHtml(mark.attrs?.href || '#')}">${html}</a>`;
              break;
            case 'subhead':
              html = `<span class="subhead">${html}</span>`;
              break;
            case 'footnote':
              html = `<sup class="footnote" data-id="${mark.attrs?.id || ''}">[${mark.attrs?.id || '?'}]</sup>${html}`;
              break;
          }
        }
        break;

      default:
        html = content;
    }

    return html;
  };

  return renderNode(doc);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}
