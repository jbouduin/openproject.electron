import { PDFFont, PDFDocument, StandardFonts, PDFPage, breakTextIntoLines } from 'pdf-lib';
import * as Collections from 'typescript-collections';
import { FontDictionaryKey } from "../options/font-dictionary-key";
import { FontStyle } from '../options/font-style';
import { IWriteTextOptions } from '../options/write-text.options';
import { PdfStatics } from '../pdf-statics';

export interface IPdfTextManager {
  /**
   * define a font set that can be used in the pdf document. This will not embed the font unless it is used
   * @param {string} key the key of the font. This name will be used in {IWriteTextOptions}
   * @param {string} normal the name of the normal font
   * @param {string} bold the name of the bold font
   * @param {string} italic the name of the italic font
   * @param {string} boldItalic the name of the bold italic font
  */
  defineFontSet(key: string, normal: string, bold: string, italic: string, boldItalic: string): void;

  /**
   * Embeds the previously defined font in the document and returns it
   * @returns {PDFFont} the embedded PDF Font
   */
  getFont(key: string, style: FontStyle): Promise<PDFFont>;

  prepareText(text: string, maxWidth: number, textHeight?: number, fontKey?: string, fontStyle?: FontStyle): Promise<IPreparedText>;

  writeTextLine(text: string, currentPage: PDFPage, fontToUse: PDFFont, options: IWriteTextOptions): void
}

export interface IPreparedText {
  font: PDFFont,
  text: Array<string> | string
}

export class PdfTextManager implements IPdfTextManager {

  // <editor-fold desc='Private properties'>
  private fonts: Collections.Dictionary<FontDictionaryKey, PDFFont | string>;
  private pdfDocument: PDFDocument;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(pdfDocument: PDFDocument) {
    this.pdfDocument = pdfDocument;
    this.fonts = new Collections.Dictionary<FontDictionaryKey, PDFFont | string>();
  }
  // </editor-fold>

  // <editor-fold desc='IPdfTextManager Interface methods'>
  public defineFontSet(key: string, normal: string, bold: string, italic: string, boldItalic: string): void {
    this.fonts.setValue(new FontDictionaryKey(key, FontStyle.normal), normal);
    this.fonts.setValue(new FontDictionaryKey(key, FontStyle.bold), bold);
    this.fonts.setValue(new FontDictionaryKey(key, FontStyle.italic), italic);
    this.fonts.setValue(new FontDictionaryKey(key, FontStyle.bold | FontStyle.italic), boldItalic);
  }

  public async getFont(key: string, style: FontStyle): Promise<PDFFont> {
    // get rid of the underline flag
    const styleToSearch = (style & FontStyle.bold) | (style & FontStyle.italic);
    const dictionaryKey = new FontDictionaryKey(key, styleToSearch);
    const fromDictionary = this.fonts.getValue(dictionaryKey);
    if (fromDictionary) {
      if (fromDictionary instanceof PDFFont) {
        return fromDictionary as PDFFont;
      } else {
        const embeddedFont = await this.pdfDocument.embedFont(fromDictionary as string);
        this.fonts.setValue(dictionaryKey, embeddedFont);
        return embeddedFont;
      }
    }
    else {
      return await this.getFont(StandardFonts.TimesRoman, style);
    }
  }

  public async prepareText(
    text: string,
    maxWidth: number,
    textHeight?: number,
    fontKey?: string,
    fontStyle?: FontStyle): Promise<IPreparedText> {

    const fontToUse = await this.getFont(fontKey || StandardFonts.TimesRoman, fontStyle || FontStyle.normal);
    const fontSize = fontToUse.sizeAtHeight(textHeight || PdfStatics.defaultTextHeight);
    const textWidth = fontToUse.widthOfTextAtSize(text || '', fontSize);
    let result: IPreparedText;

    if (textWidth > maxWidth) {
      const textArray = breakTextIntoLines(
        text,
        [' '],
        maxWidth,
        (t: string) => fontToUse.widthOfTextAtSize(t, fontSize)
      );
      result = {
        font: fontToUse,
        text: textArray
      };
    } else  {
      result = {
        font: fontToUse,
        text: text
      };
    }
    return result;
  }

  public writeTextLine(text: string, currentPage: PDFPage, fontToUse: PDFFont, options: IWriteTextOptions): void {
    const textSize = fontToUse.sizeAtHeight(options.textHeight);
    const lineWidth = fontToUse.widthOfTextAtSize(text, textSize);
    let calculatedX = options.x?.pfdPoints || currentPage.getX();
    switch (options.align) {
      case 'center': {
        calculatedX = calculatedX + ((options.maxWidth.pfdPoints - lineWidth) / 2);
        break;
      }
      case 'right': {
        calculatedX = calculatedX + options.maxWidth.pfdPoints - lineWidth;
        break;
      }
    }
    const calculatedY = options.y?.pfdPoints || currentPage.getY();
    currentPage.drawText(text, {
      size: textSize,
      font: fontToUse,
      color: options.color,
      x: calculatedX,
      y: calculatedY
    });
    currentPage.moveRight(lineWidth);
    if (options.style & FontStyle.underline) {
      const underlineTickness = ((fontToUse as any).embedder.font.UnderlineThickness / 1000) * options.textHeight;
      // use the complete underlineTicknes to calculate the position and not half of it. Although that apparently is the right way
      const underlinePosition = (((fontToUse as any).embedder.font.UnderlinePosition / 1000) * options.textHeight) - underlineTickness;

      const lineY = calculatedY + underlinePosition;
      currentPage.drawLine({
        start: { x: calculatedX, y: lineY },
        end: { x: calculatedX + lineWidth, y: lineY },
        thickness: underlineTickness,
        color: options.color || PdfStatics.defaultColor
      });
    }
    // #1169 strikeThrough: would be something like y = half of embedder.font.XHeight ?
  }
  // </editor-fold>
}
