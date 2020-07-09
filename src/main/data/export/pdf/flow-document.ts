import * as Collections from 'typescript-collections';
import { shell } from 'electron';
import * as fs from 'fs';
import { PDFDocument, PDFPage, PDFImage, StandardFonts, PDFFont, breakTextIntoLines } from "pdf-lib";
import { CreateParams } from "./create.params";
import { IWriteTextOptions, WriteTextOptions } from './write-text-options';
import { FontStyle } from './font-style';
import { FourSides } from './four-sides';
import { PdfConstants } from './pdf-constants';
import { PdfCoordinates } from './pdf-coordinates';
import { FontDictionaryKey } from './font-dictionary-key';

export class FlowDocument {

  // <editor-fold desc='Private properties'>
  private pdfDocument: PDFDocument;
  private currentPage: PDFPage | undefined;
  private headerImage: PDFImage | undefined;
  private footerImage: PDFImage | undefined;
  private defaultFontSize: number;
  private defaultLineHeight: number;
  private currentFontSize: number;
  private currentLineHeight: number;
  private margin: FourSides<number>;
  private pageSize: [number, number];
  private currentX: number;
  private currentY: number;
  private remainingHeight: number;
  private fonts: Collections.Dictionary<FontDictionaryKey, PDFFont | string>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(params: CreateParams) {
    this.pageSize = params.pageSize;
    this.defaultFontSize = 12; // fonts are in points, so no conversion is required
    this.defaultLineHeight = 1.15;
    this.currentFontSize = this.defaultFontSize;
    this.currentLineHeight = this.defaultLineHeight;
    this.margin = params.margin.transform( v => this.millimeterToPdfPoints(v));
    this.fonts = new Collections.Dictionary<FontDictionaryKey, PDFFont | string>();
    this.currentPage = undefined;
  }

  public static async createDocument(params: CreateParams): Promise<FlowDocument> {
    const result = new FlowDocument(params);
    await result.initializeDocument(params);
    return result;
  }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public async saveToFile(fullPath: string, openFile: boolean): Promise<void> {
    const pdfBytes = await this.pdfDocument.save();
    fs.writeFile(
      fullPath,
      pdfBytes,
      () => {
        if (openFile) {
          shell.openItem(fullPath);
        }
      });
  }

  public defineFontSet(key: string, normal: string, bold: string, italic: string, boldItalic: string) {
    this.fonts.setValue(new FontDictionaryKey(key, FontStyle.normal), normal);
    this.fonts.setValue(new FontDictionaryKey(key, FontStyle.bold), bold);
    this.fonts.setValue(new FontDictionaryKey(key, FontStyle.italic), italic);
    this.fonts.setValue(new FontDictionaryKey(key, FontStyle.bold | FontStyle.italic), boldItalic);
  }

  public async moveDown(lines?: number): Promise<boolean> {
    let result: boolean;

    if (!lines) {
      lines = 1;
    }
    const prev = this.currentY;
    const toMove = lines * this.currentLineHeight * this.currentFontSize;
    if (toMove > this.remainingHeight) {
      await this.addPage();
      result = true;
    } else {
      this.currentX = this.margin.left;
      this.currentY -= toMove;
      this.remainingHeight -= toMove
      result = false;
    }
    console.log('in moveDown', prev, '=>', this.currentY);
    return result;
  }

  public async newPage(): Promise<void> {
    return this.addPage();
  }

  public async writeLine(text: string, options: IWriteTextOptions): Promise<void> {
    await this.writeText(text, options);
    await this.moveDown();
  }

  public async write(text: string, options: IWriteTextOptions): Promise<void> {
    await this.writeText(text + ' ', options);
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private async loadImage(fullPath: string): Promise<PDFImage> {
    const img = await fs.promises.readFile(fullPath);
    return this.pdfDocument.embedPng(img);
  }

  private async addPage(): Promise<void> {
    this.currentPage = this.pdfDocument.addPage(this.pageSize);
    this.currentY = this.currentPage.getHeight() - this.margin.top;
    this.currentX = this.margin.left;
    this.remainingHeight = this.currentY - this.margin.bottom;
    const defaultFont = await this.getFont(StandardFonts.TimesRoman, FontStyle.normal);
    this.currentPage.setFont(defaultFont);
    this.currentPage.setFontColor(PdfConstants.defaultColor);
    if (this.headerImage) {
      const headerImageCoordinates = this.drawCenteredImage(this.headerImage, 0, 'top');
      this.currentY -= headerImageCoordinates.height;
      this.remainingHeight -= headerImageCoordinates.height;
      this.moveDown(1);
    }
    if (this.footerImage) {
      const footerImageCoordinates = this.drawCenteredImage(this.footerImage, 0, 'bottom');
      this.remainingHeight -= footerImageCoordinates.height + (this.defaultFontSize * this.defaultLineHeight);
    }

  }

  private async initializeDocument(params: CreateParams): Promise<void> {
    this.pdfDocument = await PDFDocument.create();
    this.pdfDocument.setAuthor('Johan Bouduin');
    this.pdfDocument.setTitle(params.title);
    this.pdfDocument.setCreator('https://github.com/jbouduin/openproject.electron');
    this.pdfDocument.setProducer('https://github.com/jbouduin/openproject.electron');
    if (params.headerImage) {
      this.headerImage = await this.loadImage(params.headerImage);
    }
    if (params.footerImage) {
      this.footerImage = await this.loadImage(params.footerImage);
    }
    this.defineFontSet(
      StandardFonts.TimesRoman,
      StandardFonts.TimesRoman,
      StandardFonts.TimesRomanBold,
      StandardFonts.TimesRomanItalic,
      StandardFonts.TimesRomanBoldItalic);
    this.addPage();
  }

  private async getFont(key: string, style: FontStyle): Promise<PDFFont> {
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

  private drawCenteredImage(image: PDFImage, y: number, from: 'top' | 'bottom' | 'absolute'): PdfCoordinates {
    const pageSize = this.currentPage.getSize();
    let calculatedWidth: number;
    let calculatedHeight: number;
    let calculatedX: number;
    let calculatedY: number;

    if (pageSize.width - image.width < this.margin.left + this.margin.right) {
      const factor = (pageSize.width - this.margin.left - this.margin.right) / image.width;
      const scaled = image.scale(factor);
      calculatedX = this.margin.left;
      calculatedWidth = scaled.width;
      calculatedHeight = scaled.height;
    } else {
      calculatedX = this.margin.left;
      calculatedWidth = image.width;
      calculatedHeight = image.height;
    }
    switch (from) {
      case 'top': {
        calculatedY = pageSize.height - this.margin.top - y - calculatedHeight;
        break;
      }
      case 'bottom': {
        calculatedY = this.margin.bottom + y; // - calculatedHeight;
        break;
      }
      case 'absolute': {
        calculatedY = y;
        break;
      }
    }
    const result: PdfCoordinates = {
      x: calculatedX,
      y: calculatedY,
      width: calculatedWidth,
      height: calculatedHeight
    };
    this.drawImage(image, result);
    return result;
  }

  private drawImage(image: PDFImage, coordinates: PdfCoordinates): void {
    this.currentPage.drawImage(image, coordinates);
  }

  private millimeterToPdfPoints(millimeter: number): number {
    return millimeter / PdfConstants.pdfPointInMillimeters;
  }

  private async writeText(text: string, options: IWriteTextOptions): Promise<number> {
    let result: number;
    const sizeToUse = options.size || this.defaultFontSize;
    const fontToUse = await this.getFont(options.fontKey || StandardFonts.TimesRoman, options.style || FontStyle.normal);
    const textSize = fontToUse.sizeAtHeight(sizeToUse);
    const textWidth = fontToUse.widthOfTextAtSize(text, textSize);
    const maxWidth = options.maxWidth || this.currentPage.getWidth() - this.margin.left - this.margin.right - (options.x || 0);

    this.currentFontSize = sizeToUse;
    this.currentLineHeight = options.lineHeight || this.currentLineHeight;
    const calculatedOptions = new WriteTextOptions();
    calculatedOptions.align = options.align || 'left';
    calculatedOptions.color = options.color;
    calculatedOptions.size = sizeToUse;
    calculatedOptions.maxWidth = maxWidth;
    calculatedOptions.wordBreaks = options.wordBreaks;
    calculatedOptions.x = options.x ? this.millimeterToPdfPoints(options.x) + this.margin.left : undefined;
    calculatedOptions.y = options.y ? this.millimeterToPdfPoints(options.y) : undefined;
    calculatedOptions.style = options.style;
    // not required: fontKey => was already used to calculate fontToUse
    // not required: lineHeight => was assigned to this.currentLineHeight

    if (textWidth > maxWidth) {
      const textArray = breakTextIntoLines(
        text,
        options.wordBreaks,
        maxWidth,
        (t: string) => fontToUse.widthOfTextAtSize(t, textSize)
      );
      textArray.forEach( async (line: string, index: number, array: Array<string>) => {
        this.writeTextLine(line, fontToUse, calculatedOptions);
        console.log('index', index, 'of', array.length)
        if (index < array.length - 1) {
          await this.moveDown();
        }
      });
      result = textArray.length;
    } else {
      this.writeTextLine(text, fontToUse, calculatedOptions);
      result = 1;
    }
    return result;
  }

  private writeTextLine(text: string, fontToUse: PDFFont, options: IWriteTextOptions): void {
    const textSize = fontToUse.sizeAtHeight(options.size);
    const lineWidth = fontToUse.widthOfTextAtSize(text, textSize);
    let calculatedX = options.x || this.currentX;
    switch (options.align) {
      case 'center': {
        calculatedX = (calculatedX + options.maxWidth - lineWidth) / 2;
        break;
      }
      case 'right': {
        calculatedX = calculatedX + options.maxWidth - lineWidth;
        break;
      }
    }
    console.log('writing @', this.currentY, '=>', text);

    this.currentPage.drawText(text, {
      size: textSize,
      font: fontToUse,
      color: options.color,
      x: calculatedX,
      y: options.y || this.currentY
    });
    this.currentX = calculatedX + lineWidth;
    if (options.style & FontStyle.underline) {
      const underlineTickness = ((fontToUse as any).embedder.font.UnderlineThickness / 1000) * options.size;
      // use the complete underlineTicknes and not half of it. Although that apparently is the right way
      const underlinePosition = (((fontToUse as any).embedder.font.UnderlinePosition / 1000) * options.size) - underlineTickness;

      const lineY = this.currentY + underlinePosition;
      this.currentPage.drawLine({
        start: { x: calculatedX, y: lineY },
        end: { x: calculatedX + lineWidth, y: lineY },
        thickness: underlineTickness,
        color: options.color || PdfConstants.defaultColor
      });
    }
    // TODO #1169 strikeThrough: would be something like y = half of embedder.font.XHeight ?
  }
  // </editor-fold>
}
