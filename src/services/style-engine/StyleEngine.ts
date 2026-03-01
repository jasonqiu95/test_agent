import { BookStyle, StyleConfig } from '../../models/Book';
import { getStyleById } from '../../data/book-styles';

export class StyleEngine {
  /**
   * Generate CSS for a given book style with optional customizations
   */
  static generateCSS(styleConfig: StyleConfig): string {
    const baseStyle = getStyleById(styleConfig.selectedStyleId);
    if (!baseStyle) {
      return '';
    }

    // Merge base style with customizations
    const mergedStyle = this.mergeStyleWithCustomizations(baseStyle, styleConfig.customizations);

    return this.buildCSS(mergedStyle);
  }

  /**
   * Merge base style with customizations
   */
  private static mergeStyleWithCustomizations(
    baseStyle: BookStyle,
    customizations: StyleConfig['customizations']
  ): BookStyle {
    return {
      ...baseStyle,
      heading: { ...baseStyle.heading, ...(customizations.heading || {}) },
      firstParagraph: { ...baseStyle.firstParagraph, ...(customizations.firstParagraph || {}) },
      body: { ...baseStyle.body, ...(customizations.body || {}) },
      dropCap: { ...baseStyle.dropCap, ...(customizations.dropCap || {}) },
      ornamentalBreak: { ...baseStyle.ornamentalBreak, ...(customizations.ornamentalBreak || {}) },
      blockQuote: { ...baseStyle.blockQuote, ...(customizations.blockQuote || {}) },
      verse: { ...baseStyle.verse, ...(customizations.verse || {}) },
    };
  }

  /**
   * Build CSS string from merged style
   */
  private static buildCSS(style: BookStyle): string {
    const css: string[] = [];

    // Body/paragraph styles
    css.push(`
      .book-content p {
        font-family: ${style.body.fontFamily};
        font-size: ${style.body.fontSize}px;
        line-height: ${style.body.lineHeight};
        text-align: ${style.body.textAlign};
        margin-bottom: ${style.body.paragraphSpacing}px;
        text-indent: ${style.body.firstLineIndent}px;
      }
    `);

    // First paragraph (no indent on first paragraph after heading)
    css.push(`
      .book-content h1 + p,
      .book-content h2 + p,
      .book-content .chapter-start + p {
        text-indent: 0;
      }
    `);

    // First paragraph with small caps if enabled
    if (style.firstParagraph.smallCaps) {
      css.push(`
        .book-content .first-paragraph {
          font-variant: small-caps;
          font-size: ${style.firstParagraph.fontSize}px;
        }
      `);
    }

    // Heading styles
    css.push(`
      .book-content h1,
      .book-content .chapter-heading {
        font-family: ${style.heading.fontFamily};
        font-size: ${style.heading.fontSize}px;
        font-weight: ${style.heading.fontWeight};
        text-align: ${style.heading.textAlign};
        text-transform: ${style.heading.textTransform};
        letter-spacing: ${style.heading.letterSpacing}px;
        margin-top: ${style.heading.marginTop}px;
        margin-bottom: ${style.heading.marginBottom}px;
        color: ${style.heading.color};
      }
    `);

    css.push(`
      .book-content h2 {
        font-family: ${style.heading.fontFamily};
        font-size: ${style.heading.fontSize * 0.8}px;
        font-weight: ${style.heading.fontWeight};
        text-align: ${style.heading.textAlign};
        text-transform: ${style.heading.textTransform};
        letter-spacing: ${style.heading.letterSpacing}px;
        margin-top: ${style.heading.marginTop * 0.7}px;
        margin-bottom: ${style.heading.marginBottom * 0.7}px;
        color: ${style.heading.color};
      }
    `);

    // Drop cap styles
    if (style.dropCap.enabled) {
      css.push(`
        .book-content .drop-cap::first-letter {
          font-family: ${style.dropCap.fontFamily};
          font-size: ${style.body.fontSize * style.dropCap.lines * 0.9}px;
          line-height: ${style.dropCap.lines * 0.8};
          float: left;
          margin-right: 8px;
          margin-top: 4px;
          color: ${style.dropCap.color};
          font-weight: bold;
        }
      `);
    }

    // Ornamental break styles
    css.push(`
      .book-content .ornamental-break {
        text-align: center;
        font-size: ${style.ornamentalBreak.fontSize}px;
        color: ${style.ornamentalBreak.color};
        margin-top: ${style.ornamentalBreak.spacing}px;
        margin-bottom: ${style.ornamentalBreak.spacing}px;
        user-select: none;
      }
      .book-content .ornamental-break::before {
        content: '${style.ornamentalBreak.symbol}';
      }
    `);

    // Block quote styles
    css.push(`
      .book-content blockquote {
        font-family: ${style.blockQuote.fontFamily};
        font-size: ${style.blockQuote.fontSize}px;
        font-style: ${style.blockQuote.fontStyle};
        margin-left: ${style.blockQuote.marginLeft}px;
        margin-right: ${style.blockQuote.marginRight}px;
        margin-top: ${style.body.paragraphSpacing * 1.5}px;
        margin-bottom: ${style.body.paragraphSpacing * 1.5}px;
        ${style.blockQuote.borderLeft ? `border-left: 3px solid ${style.blockQuote.borderColor};` : ''}
        ${style.blockQuote.borderLeft ? `padding-left: 16px;` : ''}
      }
    `);

    // Verse/poetry styles
    css.push(`
      .book-content .verse,
      .book-content .poetry {
        font-family: ${style.verse.fontFamily};
        font-size: ${style.verse.fontSize}px;
        font-style: ${style.verse.fontStyle};
        text-align: ${style.verse.textAlign};
        margin-top: ${style.body.paragraphSpacing * 1.5}px;
        margin-bottom: ${style.body.paragraphSpacing * 1.5}px;
        white-space: pre-line;
      }
    `);

    // General text formatting
    css.push(`
      .book-content em,
      .book-content i {
        font-style: italic;
      }
      .book-content strong,
      .book-content b {
        font-weight: 700;
      }
      .book-content a {
        color: inherit;
        text-decoration: underline;
      }
    `);

    return css.join('\n');
  }

  /**
   * Generate inline styles for preview cards
   */
  static generatePreviewStyles(style: BookStyle): React.CSSProperties {
    return {
      fontFamily: style.body.fontFamily,
      fontSize: `${style.body.fontSize}px`,
      lineHeight: style.body.lineHeight,
    };
  }

  /**
   * Apply style to a DOM element
   */
  static applyStylesToElement(element: HTMLElement, styleConfig: StyleConfig): void {
    const css = this.generateCSS(styleConfig);

    // Create or update style element
    let styleEl = element.querySelector('#book-style') as HTMLStyleElement;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'book-style';
      element.appendChild(styleEl);
    }
    styleEl.textContent = css;
  }

  /**
   * Generate CSS for specific element (e.g., just headings)
   */
  static generateHeadingCSS(style: BookStyle): string {
    return `
      font-family: ${style.heading.fontFamily};
      font-size: ${style.heading.fontSize}px;
      font-weight: ${style.heading.fontWeight};
      text-align: ${style.heading.textAlign};
      text-transform: ${style.heading.textTransform};
      letter-spacing: ${style.heading.letterSpacing}px;
      color: ${style.heading.color};
    `;
  }

  /**
   * Generate CSS for body text
   */
  static generateBodyCSS(style: BookStyle): string {
    return `
      font-family: ${style.body.fontFamily};
      font-size: ${style.body.fontSize}px;
      line-height: ${style.body.lineHeight};
      text-align: ${style.body.textAlign};
    `;
  }
}
