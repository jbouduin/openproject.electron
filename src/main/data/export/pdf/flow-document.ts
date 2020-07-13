import { shell } from 'electron';
import * as fs from 'fs';
import { PDFDocument, PDFPage, PDFImage, StandardFonts } from "pdf-lib";
import { CreateDocumentOptions } from "./create-document.options";
import { IWriteTextOptions, WriteTextOptions } from './write-text.options';
import { FontStyle } from './font-style';
import { FourSides } from './four-sides';
import { PdfConstants } from './pdf-constants';
import { PdfCoordinates } from './pdf-coordinates';
import { IPdfTable } from './pdf-table';
import { PdfTextManager, IPdfTextManager } from './pdf-text-manager';

export interface IFlowDocument {
  /**
   * @function moveDown
   * @description Similar to a CR/LF on a good old fashioned typewriter. It will add a page to the document if required
   * @param {number} lines the number of new lines
   * @returns true if moving down caused a new page to be added
  */
  moveDown(lines?: number): Promise<boolean>;
  /**
   * Adds a new page to the document
  */
  newPage(): Promise<void>;
  saveToFile(fullPath: string, openFile: boolean): Promise<void>;
  setLineHeight(value: number): void;
  setTextHeight(value: number): void;
  writeLine(text: string, options: IWriteTextOptions): Promise<void>;
  writeTable(table: IPdfTable): Promise<void>;
  write(text: string, options: IWriteTextOptions): Promise<void>;
}

export class FlowDocument {

  // <editor-fold desc='Private properties'>
  private pdfDocument: PDFDocument;
  private currentPage: PDFPage | undefined;
  private headerImage: PDFImage | undefined;
  private footerImage: PDFImage | undefined;
  private textManager: IPdfTextManager;
  private currentTextHeight: number;
  private currentLineHeight: number;
  private margin: FourSides<number>;
  private pageSize: [number, number];
  private lowestY: number;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(params: CreateDocumentOptions) {
    this.pageSize = params.pageSize;
    this.currentTextHeight = PdfConstants.defaultTextHeight;
    this.currentLineHeight = PdfConstants.defaultLineHeight;
    this.margin = params.margin.transform( v => this.millimeterToPdfPoints(v));
    this.currentPage = undefined;
  }

  public static async createDocument(params: CreateDocumentOptions): Promise<IFlowDocument> {
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

  public setLineHeight(value: number): void {
    this.currentLineHeight = value;
  }

  public setTextHeight(value: number): void {
    this.currentTextHeight = value;
  }

  public async moveDown(lines?: number): Promise<boolean> {
    let result: boolean;
    if (!lines) {
      lines = 1;
    }
    const newY = this.currentPage.getY() - (lines * this.currentLineHeight * this.currentTextHeight);
    if (newY < this.lowestY) {
      await this.addPageLikeLast();
      result = true;
    } else {
      this.currentPage.moveTo(this.margin.left, newY);
      result = false;
    }
    return result;
  }

  // #1184 orientaton: 'portrait' | 'landscape'
  // optional input parameter. If not set use document orientation
  // otherwise use the paramter value
  public async newPage(): Promise<void> {
      await this.addPage(this.pageSize);
    return;
  }

  public async writeLine(text: string, options: IWriteTextOptions): Promise<void> {
    await this.writeText(text, options);
    await this.moveDown();
    return;
  }

  public async writeTable(table: IPdfTable): Promise<void> {
    await table.prepareTable(
      this.currentPage.getWidth() - this.margin.left - this.margin.right,
      this.textManager);
    table.writeTable(
      this.margin.left,
      this.currentPage.getY(),
      this.lowestY,
      this.currentPage,
      this.textManager,
      this.addPageLikeLast.bind(this)
    );
    return;
  }

  public async write(text: string, options: IWriteTextOptions): Promise<void> {
    await this.writeText(text + ' ', options);
    return;
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private async loadImage(fullPath: string): Promise<PDFImage> {
    const img = await fs.promises.readFile(fullPath);
    return this.pdfDocument.embedPng(img);
  }

  private async addPageLikeLast(): Promise<PDFPage> {
    const currentPageSize = this.currentPage.getSize();
    return this.addPage([currentPageSize.width, currentPageSize.height]);
  }

  private async addPage(pageSize: [number, number]): Promise<PDFPage> {
    this.currentPage = this.pdfDocument.addPage(pageSize);
    this.currentPage.moveTo(this.margin.left, this.currentPage.getHeight() - this.margin.top);
    const defaultFont = await this.textManager.getFont(StandardFonts.TimesRoman, FontStyle.normal);
    this.currentPage.setFont(defaultFont);
    this.currentPage.setFontColor(PdfConstants.defaultColor);
    if (this.headerImage) {
      const headerImageCoordinates = this.drawCenteredImage(this.headerImage, 0, 'top');
      this.currentPage.moveDown(headerImageCoordinates.height);
      // move one line down below the header
      this.moveDown(1);
    }
    // #1183 headertext
    if (this.footerImage) {
      const footerImageCoordinates = this.drawCenteredImage(this.footerImage, 0, 'bottom');
      // leave at least one line above the footer image
      this.lowestY = this.margin.bottom + footerImageCoordinates.height +
        (this.currentTextHeight * this.currentLineHeight);
    }
    // #1183 footertext
    console.log('number of pages:', this.pdfDocument.getPages().length);
    return this.currentPage;
  }

  private async initializeDocument(params: CreateDocumentOptions): Promise<void> {
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
    this.textManager = new PdfTextManager(this.pdfDocument);
    this.textManager.defineFontSet(
      StandardFonts.TimesRoman,
      StandardFonts.TimesRoman,
      StandardFonts.TimesRomanBold,
      StandardFonts.TimesRomanItalic,
      StandardFonts.TimesRomanBoldItalic);
    await this.newPage();
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
    this.currentTextHeight = options.textHeight || PdfConstants.defaultTextHeight;
    this.currentLineHeight = options.lineHeight || PdfConstants.defaultLineHeight;
    const calculatedMax = options.maxWidth || this.currentPage.getWidth() - this.margin.left - this.margin.right - (this.millimeterToPdfPoints(options.x) || 0);
    const prepared = await this.textManager.prepareText(
      text,
      calculatedMax,
      this.currentTextHeight,
      options.fontKey,
      options.style
    );

    const calculatedOptions = new WriteTextOptions();
    calculatedOptions.align = options.align || 'left';
    calculatedOptions.color = options.color;
    calculatedOptions.textHeight = this.currentTextHeight;
    calculatedOptions.maxWidth = calculatedMax;
    calculatedOptions.wordBreaks = options.wordBreaks;
    calculatedOptions.x = options.x ? this.millimeterToPdfPoints(options.x) + this.margin.left : undefined;
    calculatedOptions.y = options.y ? this.millimeterToPdfPoints(options.y) : undefined;
    calculatedOptions.style = options.style;
    // not required: fontKey => was already used to calculate fontToUse
    // not required: lineHeight => was assigned to this.currentLineHeight
    if (Array.isArray(prepared.text)) {
      prepared.text.forEach( async (line: string, index: number, array: Array<string>) => {
        this.textManager.writeTextLine(line, this.currentPage, prepared.font, calculatedOptions);
        if (index < array.length - 1) {
          await this.moveDown();
        }
      });
      result = prepared.text.length;
    } else {
      this.textManager.writeTextLine(text, this.currentPage, prepared.font, calculatedOptions);
      result = 1;
    }
    return result;
  }

  // </editor-fold>
}
