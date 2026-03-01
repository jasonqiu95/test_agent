import { BookElement, ElementType } from '../../models/Book';
import { DOMParser as ProseMirrorDOMParser } from 'prosemirror-model';
import { mySchema } from '../../components/Editor/ProseMirrorEditor';

interface ImportResult {
  elements: BookElement[];
  warnings: string[];
}

// Chapter detection heuristics
function detectChapters(html: string): { title: string; content: string; type: ElementType }[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const sections: { title: string; content: string; type: ElementType }[] = [];

  // Find all potential chapter headings (h1, h2, or lines starting with "Chapter")
  const allElements = Array.from(doc.body.children);
  let currentSection: { title: string; content: HTMLElement[]; type: ElementType } | null = null;

  for (const element of allElements) {
    const text = element.textContent?.trim() || '';
    const tagName = element.tagName.toLowerCase();

    // Check if this looks like a chapter heading
    const isChapterHeading =
      tagName === 'h1' ||
      tagName === 'h2' ||
      /^chapter\s+\d+/i.test(text) ||
      /^part\s+\d+/i.test(text) ||
      /^prologue$/i.test(text) ||
      /^epilogue$/i.test(text);

    if (isChapterHeading) {
      // Save previous section if exists
      if (currentSection) {
        const contentHtml = currentSection.content.map(el => el.outerHTML).join('');
        sections.push({
          title: currentSection.title,
          content: contentHtml,
          type: currentSection.type,
        });
      }

      // Determine element type
      let type: ElementType = 'chapter';
      if (/^prologue$/i.test(text)) type = 'prologue';
      else if (/^epilogue$/i.test(text)) type = 'epilogue';
      else if (/^part\s+\d+/i.test(text)) type = 'part';

      // Start new section
      currentSection = {
        title: text || `Chapter ${sections.length + 1}`,
        content: [],
        type,
      };
    } else if (currentSection) {
      // Add to current section
      currentSection.content.push(element as HTMLElement);
    } else {
      // No section yet - start a default one
      currentSection = {
        title: 'Chapter 1',
        content: [element as HTMLElement],
        type: 'chapter',
      };
    }
  }

  // Save final section
  if (currentSection) {
    const contentHtml = currentSection.content.map(el => el.outerHTML).join('');
    sections.push({
      title: currentSection.title,
      content: contentHtml,
      type: currentSection.type,
    });
  }

  // If no chapters detected, treat whole document as one chapter
  if (sections.length === 0) {
    sections.push({
      title: 'Chapter 1',
      content: html,
      type: 'chapter',
    });
  }

  return sections;
}

// Convert HTML to ProseMirror document
function htmlToProseMirror(html: string): any {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Use ProseMirror's DOMParser to convert
    const proseMirrorParser = ProseMirrorDOMParser.fromSchema(mySchema);
    const proseMirrorDoc = proseMirrorParser.parse(doc.body);

    return proseMirrorDoc.toJSON();
  } catch (error) {
    console.error('Error converting HTML to ProseMirror:', error);
    // Return empty document on error
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    };
  }
}

export async function importDocx(filePath: string): Promise<ImportResult> {
  const warnings: string[] = [];

  try {
    // Call Electron IPC to import DOCX
    const result = await window.electronAPI.import.docx(filePath);

    if (!result.success) {
      throw new Error(result.error || 'Failed to import DOCX');
    }

    const html = result.html || '';

    // Detect chapters
    const sections = detectChapters(html);

    if (sections.length > 20) {
      warnings.push(
        `Detected ${sections.length} chapters. This seems high - you may want to review the chapter detection.`
      );
    }

    // Convert sections to BookElements
    const elements: BookElement[] = sections.map((section, index) => ({
      id: crypto.randomUUID(),
      type: section.type,
      title: section.title,
      order: index,
      content: htmlToProseMirror(section.content),
    }));

    return {
      elements,
      warnings,
    };
  } catch (error) {
    throw new Error(`Failed to import DOCX: ${(error as Error).message}`);
  }
}

export function formatChapterTitle(title: string, index: number): string {
  // If title is generic, use chapter number
  if (!title || title.toLowerCase() === 'chapter') {
    return `Chapter ${index + 1}`;
  }
  return title;
}
