import JSZip from 'jszip';
import { BookProject, BookElement } from '../../models/Book';
import { StyleEngine } from '../style-engine/StyleEngine';

export class EpubBuilder {
  private zip: JSZip;
  private project: BookProject;

  constructor(project: BookProject) {
    this.zip = new JSZip();
    this.project = project;
  }

  /**
   * Generate EPUB file and return as Blob
   */
  async generate(): Promise<Blob> {
    // Add mimetype (must be first, uncompressed)
    this.zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // Add META-INF
    this.addMetaInf();

    // Add OEBPS directory
    this.addOEBPS();

    // Generate zip
    return await this.zip.generateAsync({
      type: 'blob',
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
    });
  }

  /**
   * Add META-INF/container.xml
   */
  private addMetaInf() {
    const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

    this.zip.folder('META-INF')?.file('container.xml', containerXml);
  }

  /**
   * Add OEBPS directory with all content
   */
  private addOEBPS() {
    const oebps = this.zip.folder('OEBPS');
    if (!oebps) return;

    // Add CSS
    const css = StyleEngine.generateCSS(this.project.styleConfig);
    oebps.file('styles.css', this.generateEpubCSS(css));

    // Add content.opf
    oebps.file('content.opf', this.generateContentOpf());

    // Add nav.xhtml
    oebps.file('nav.xhtml', this.generateNavXhtml());

    // Add chapter files
    this.project.elements.forEach((element, index) => {
      const xhtml = this.generateChapterXhtml(element);
      oebps.file(`chapter${index + 1}.xhtml`, xhtml);
    });

    // Add cover image if exists
    if (this.project.exportSettings.coverImagePath) {
      // In a real implementation, we'd read the image file
      // For now, we'll skip this as it requires file system access
    }
  }

  /**
   * Generate content.opf (package document)
   */
  private generateContentOpf(): string {
    const metadata = this.project.metadata;
    const elements = this.project.elements;
    const now = new Date().toISOString();

    const manifestItems = elements
      .map(
        (_, index) =>
          `    <item id="chapter${index + 1}" href="chapter${index + 1}.xhtml" media-type="application/xhtml+xml"/>`
      )
      .join('\n');

    const spineItems = elements.map((_, index) => `    <itemref idref="chapter${index + 1}"/>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:identifier id="bookid">${metadata.isbn || `urn:uuid:${this.project.id}`}</dc:identifier>
    <dc:title>${this.escapeXml(metadata.title)}</dc:title>
    <dc:creator>${this.escapeXml(metadata.author)}</dc:creator>
    <dc:language>${metadata.language}</dc:language>
    <dc:date>${metadata.publishDate || now.split('T')[0]}</dc:date>
    ${metadata.publisher ? `<dc:publisher>${this.escapeXml(metadata.publisher)}</dc:publisher>` : ''}
    ${metadata.description ? `<dc:description>${this.escapeXml(metadata.description)}</dc:description>` : ''}
    ${metadata.genres?.map(genre => `<dc:subject>${this.escapeXml(genre)}</dc:subject>`).join('\n    ') || ''}
    <meta property="dcterms:modified">${now}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="styles" href="styles.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>`;
  }

  /**
   * Generate nav.xhtml (table of contents)
   */
  private generateNavXhtml(): string {
    const metadata = this.project.metadata;
    const elements = this.project.elements;

    const tocItems = elements
      .filter(el => el.type === 'chapter' || el.type === 'part' || el.type === 'volume' || el.type === 'prologue' || el.type === 'epilogue')
      .map(element => {
        const actualIndex = this.project.elements.indexOf(element);
        return `      <li><a href="chapter${actualIndex + 1}.xhtml">${this.escapeXml(element.title)}</a></li>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>Table of Contents</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
${tocItems}
    </ol>
  </nav>
  <nav epub:type="landmarks" hidden="">
    <ol>
      <li><a epub:type="toc" href="nav.xhtml">Table of Contents</a></li>
      <li><a epub:type="bodymatter" href="chapter1.xhtml">${this.escapeXml(metadata.title)}</a></li>
    </ol>
  </nav>
</body>
</html>`;
  }

  /**
   * Generate chapter XHTML
   */
  private generateChapterXhtml(element: BookElement): string {
    const contentHtml = this.convertProseMirrorToXhtml(element.content);

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <meta charset="UTF-8"/>
  <title>${this.escapeXml(element.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles.css"/>
</head>
<body class="book-content">
  ${element.title && element.type !== 'title-page' ? `<h1 class="chapter-heading">${this.escapeXml(element.title)}</h1>` : ''}
  ${contentHtml}
</body>
</html>`;
  }

  /**
   * Convert ProseMirror JSON to XHTML
   */
  private convertProseMirrorToXhtml(doc: any): string {
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
          html = `<p>${content || '&#160;'}</p>`;
          break;

        case 'heading':
          const level = node.attrs?.level || 1;
          html = `<h${level}>${content}</h${level}>`;
          break;

        case 'blockquote':
          html = `<blockquote>${content}</blockquote>`;
          break;

        case 'code_block':
          html = `<pre><code>${this.escapeXml(content)}</code></pre>`;
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
          html = '<hr/>';
          break;

        case 'hard_break':
          html = '<br/>';
          break;

        case 'scene_break':
        case 'ornamental_break':
          html = `<div class="ornamental-break">${node.attrs?.symbol || ''}</div>`;
          break;

        case 'verse':
          html = `<div class="verse">${content}</div>`;
          break;

        case 'text':
          html = this.escapeXml(node.text || '');
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
                html = `<a href="${this.escapeXml(mark.attrs?.href || '#')}">${html}</a>`;
                break;
              case 'subhead':
                html = `<span class="subhead">${html}</span>`;
                break;
              case 'footnote':
                const id = mark.attrs?.id || '';
                html = `<sup class="footnote" id="fn${id}"><a href="#fnref${id}">[${id}]</a></sup>${html}`;
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
   * Generate EPUB-specific CSS
   */
  private generateEpubCSS(baseCSS: string): string {
    return `
/* Base styles from book style */
${baseCSS}

/* EPUB-specific styles */
body {
  margin: 0;
  padding: 1em;
}

.chapter-heading {
  page-break-before: always;
  margin-top: 3em;
}

.ornamental-break {
  page-break-inside: avoid;
}

blockquote {
  page-break-inside: avoid;
}

h1, h2, h3, h4, h5, h6 {
  page-break-after: avoid;
}

img {
  max-width: 100%;
  height: auto;
}

.footnote {
  font-size: 0.85em;
  vertical-align: super;
  line-height: 0;
}
`;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }
}

/**
 * Generate EPUB from project
 */
export async function generateEpub(project: BookProject): Promise<Blob> {
  const builder = new EpubBuilder(project);
  return await builder.generate();
}
