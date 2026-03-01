// Core data models for the Vellum Clone application

export type ElementType =
  | 'title-page'
  | 'half-title'
  | 'copyright'
  | 'dedication'
  | 'epigraph'
  | 'table-of-contents'
  | 'foreword'
  | 'introduction'
  | 'preface'
  | 'prologue'
  | 'chapter'
  | 'epilogue'
  | 'afterword'
  | 'endnotes'
  | 'bibliography'
  | 'acknowledgments'
  | 'about-author'
  | 'also-by'
  | 'full-page-image'
  | 'part'
  | 'volume';

export interface BookElement {
  id: string;
  type: ElementType;
  title: string;
  order: number;
  content: any; // ProseMirror JSON document
  metadata?: {
    subtitle?: string;
    chapterNumber?: number;
    hideTitle?: boolean;
  };
}

export interface BookMetadata {
  title: string;
  subtitle?: string;
  author: string;
  authorBio?: string;
  isbn?: string;
  publisher?: string;
  publishDate?: string;
  language: string;
  genres?: string[];
  description?: string;
}

export interface StyleConfig {
  selectedStyleId: string;
  customizations: {
    heading?: Partial<HeadingStyle>;
    firstParagraph?: Partial<FirstParagraphStyle>;
    body?: Partial<BodyStyle>;
    dropCap?: Partial<DropCapStyle>;
    ornamentalBreak?: Partial<OrnamentalBreakStyle>;
    blockQuote?: Partial<BlockQuoteStyle>;
    verse?: Partial<VerseStyle>;
  };
}

export interface HeadingStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  textAlign: 'left' | 'center' | 'right';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpacing: number;
  marginTop: number;
  marginBottom: number;
  color: string;
}

export interface FirstParagraphStyle {
  dropCap: boolean;
  smallCaps: boolean;
  fontSize: number;
}

export interface BodyStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textAlign: 'left' | 'justify';
  paragraphSpacing: number;
  firstLineIndent: number;
}

export interface DropCapStyle {
  enabled: boolean;
  lines: number;
  fontFamily: string;
  color: string;
}

export interface OrnamentalBreakStyle {
  symbol: string;
  fontSize: number;
  color: string;
  spacing: number;
}

export interface BlockQuoteStyle {
  fontFamily: string;
  fontSize: number;
  fontStyle: 'normal' | 'italic';
  marginLeft: number;
  marginRight: number;
  borderLeft: boolean;
  borderColor: string;
}

export interface VerseStyle {
  fontFamily: string;
  fontSize: number;
  fontStyle: 'normal' | 'italic';
  textAlign: 'left' | 'center' | 'right';
}

export interface BookStyle {
  id: string;
  name: string;
  category: 'serif' | 'sans-serif' | 'script' | 'modern';
  description: string;
  heading: HeadingStyle;
  firstParagraph: FirstParagraphStyle;
  body: BodyStyle;
  dropCap: DropCapStyle;
  ornamentalBreak: OrnamentalBreakStyle;
  blockQuote: BlockQuoteStyle;
  verse: VerseStyle;
}

export type TrimSize =
  | '5x8'
  | '5.25x8'
  | '5.5x8.5'
  | '6x9'
  | '7x10'
  | '8x10'
  | '8.5x11'
  | 'a4'
  | 'a5';

export interface ExportSettings {
  trimSize: TrimSize;
  coverImagePath?: string;
  includePageNumbers: boolean;
  includeHeaders: boolean;
  includeFooters: boolean;
  headerText?: string;
  footerText?: string;
}

export interface BookProject {
  id: string;
  metadata: BookMetadata;
  elements: BookElement[];
  styleConfig: StyleConfig;
  exportSettings: ExportSettings;
  createdAt: string;
  updatedAt: string;
  filePath?: string;
}

// Helper function to get display name for element types
export function getElementTypeName(type: ElementType): string {
  const names: Record<ElementType, string> = {
    'title-page': 'Title Page',
    'half-title': 'Half Title',
    'copyright': 'Copyright',
    'dedication': 'Dedication',
    'epigraph': 'Epigraph',
    'table-of-contents': 'Table of Contents',
    'foreword': 'Foreword',
    'introduction': 'Introduction',
    'preface': 'Preface',
    'prologue': 'Prologue',
    'chapter': 'Chapter',
    'epilogue': 'Epilogue',
    'afterword': 'Afterword',
    'endnotes': 'Endnotes',
    'bibliography': 'Bibliography',
    'acknowledgments': 'Acknowledgments',
    'about-author': 'About the Author',
    'also-by': 'Also By',
    'full-page-image': 'Full Page Image',
    'part': 'Part',
    'volume': 'Volume',
  };
  return names[type];
}

// Helper function to categorize elements
export function getElementCategory(type: ElementType): 'front' | 'content' | 'back' {
  const frontMatter: ElementType[] = [
    'title-page',
    'half-title',
    'copyright',
    'dedication',
    'epigraph',
    'table-of-contents',
    'foreword',
    'introduction',
    'preface',
    'prologue',
  ];

  const backMatter: ElementType[] = [
    'epilogue',
    'afterword',
    'endnotes',
    'bibliography',
    'acknowledgments',
    'about-author',
    'also-by',
  ];

  if (frontMatter.includes(type)) return 'front';
  if (backMatter.includes(type)) return 'back';
  return 'content';
}
