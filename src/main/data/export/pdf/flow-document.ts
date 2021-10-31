import { shell } from 'electron';
import * as fs from 'fs';
import { PDFDocument, PDFPage, PDFImage, StandardFonts } from "pdf-lib";
import { IPdfHeaderFooterFields } from './content/pdf-header-footer-fields';
import { IPdfHeaderFooter, PdfHeaderFooter } from './content/pdf-header-footer';
import { PdfTextManager, IPdfTextManager } from './content/pdf-text-manager';
import { IDocumentOptions } from "./options/document.options";
import { FontStyle } from './options/font-style';
import { ITableOptions, TableOptions } from './options/table.options';
import { ITextOptions, TextOptions } from './options/text.options';
import { PdfCoordinates } from './size/pdf-coordinates';
import { IPdfTable, PdfTable } from './table/pdf-table';

export interface IFlowDocument {
  addFooterImage(image: string): Promise<void>;
  addFooterText(textOptions: ITextOptions, left?: string, center?: string, right?: string): void;
  addHeaderImage(image: string): Promise<void>;
  addHeaderText(textOptions: ITextOptions, left?: string, center?: string, right?: string): void;

  getTableOptions(): ITableOptions;
  getTextOptions(): ITextOptions;
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
  writeHeadersAndFooters(fields: IPdfHeaderFooterFields): Promise<void>;
  writeLine(text: string, options: ITextOptions): Promise<void>;
  writeTable(tableOptions: ITableOptions, callback: (table: IPdfTable, ...args: Array<any>) => void, ...args: Array<any>): Promise<void>;
  write(text: string, options: ITextOptions): Promise<void>;
}

export class FlowDocument {

  // <editor-fold desc='Private properties'>
  private pdfDocument: PDFDocument;
  private currentPage: PDFPage | undefined;
  private headerBlock: IPdfHeaderFooter | undefined;
  private headerImage: PDFImage | undefined;
  private headerY: number;
  private footerBlock: IPdfHeaderFooter | undefined;
  private footerImage: PDFImage | undefined;
  private footerY: number;
  private documentOptions: IDocumentOptions;
  private textManager: IPdfTextManager;
  private currentTextHeight: number;
  private currentLineHeight: number;
  private lowestY: number;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  private constructor(options: IDocumentOptions) {
    this.documentOptions = options;
    this.currentTextHeight = options.defaultTextHeight;
    this.currentLineHeight = options.defaultLineHeight;
    this.currentPage = undefined;
  }

  public static async createDocument(options: IDocumentOptions): Promise<IFlowDocument> {
    const result = new FlowDocument(options);
    await result.initializeDocument(options);
    return result;
  }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public async addFooterImage(image: string): Promise<void> {
    console.log('loading footer image:', image);
    this.footerImage = await this.loadImage(image);
  }

  public addFooterText(textOptions: ITextOptions, left?: string, center?: string, right?: string): void {
    this.footerBlock = new PdfHeaderFooter(this.documentOptions, textOptions);
    this.footerBlock.left = left;
    this.footerBlock.center = center;
    this.footerBlock.right = right;
  }

  public async addHeaderImage(image: string): Promise<void> {
    console.log('loading header image:', image);
    this.headerImage = await this.loadImage(image);
  }

  public addHeaderText(textOptions: ITextOptions, left?: string, center?: string, right?: string): void {
    this.headerBlock = new PdfHeaderFooter(this.documentOptions, textOptions);
    this.headerBlock.left = left;
    this.headerBlock.center = center;
    this.headerBlock.right = right;
  }

  public getTableOptions(): ITableOptions {
    return new TableOptions(this.documentOptions);
  }

  public getTextOptions(): ITextOptions {
    return new TextOptions(this.documentOptions);
  }

  public async saveToFile(fullPath: string, openFile: boolean): Promise<void> {
    const pdfBytes = await this.pdfDocument.save();
    fs.writeFile(
      fullPath,
      pdfBytes,
      () => {
        if (openFile) {
          shell.openPath(fullPath);
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
    if (!this.currentPage) {
      await this.newPage();
    }
    let result: boolean;
    if (!lines) {
      lines = 1;
    }
    const newY = this.currentPage.getY() - (lines * this.currentLineHeight * this.currentTextHeight);
    console.log('y:', this.currentPage.getY(), '- (', lines, 'x', this.currentLineHeight, 'x', this.currentTextHeight, ') =', newY);
    if (newY < this.lowestY) {
      await this.addPageLikeLast();
      result = true;
    } else {
      this.currentPage.moveTo(this.documentOptions.margin.left.pfdPoints, newY);
      result = false;
    }
    return result;
  }

  // #1184 orientaton: 'portrait' | 'landscape'
  // optional input parameter. If not set use document orientation
  // otherwise use the paramter value
  public async newPage(): Promise<void> {
      await this.addPage([ this.documentOptions.pageSize.width.pfdPoints, this.documentOptions.pageSize.height.pfdPoints ]);
    return;
  }

  public async writeHeadersAndFooters(fields: IPdfHeaderFooterFields): Promise<void> {
    if (this.headerBlock || this.footerBlock) {
      fields.totalPages = this.pdfDocument.getPageCount();

      for(let pageIdx = 0; pageIdx < fields.totalPages; pageIdx++) {
        fields.pageNumber = pageIdx + 1;
        const thePage = this.pdfDocument.getPage(pageIdx);
        if (this.headerBlock) {
          console.log('writing header block @', this.headerY);
          await this.headerBlock.write(this.headerY, thePage, this.textManager, fields);
        }
        if (this.footerBlock) {
          console.log('writing footer block @', this.footerY);
          await this.footerBlock.write(this.footerY, thePage, this.textManager, fields);
        }
      }
    }
    return;
  }

  public async writeLine(text: string, options: ITextOptions): Promise<void> {
    if (!this.currentPage) {
      await this.newPage();
    }
    await this.writeText(text, options);
    await this.moveDown();
    return;
  }

  public async writeTable(tableOptions: ITableOptions, callback: (table: IPdfTable, ...args: Array<any>) => void, ...args: Array<any>): Promise<void> {
    if (!this.currentPage) {
      await this.newPage();
    }
    const table = new PdfTable(tableOptions);
    callback(table, ...args);
    await table.prepareTable(
      this.currentPage.getWidth() - this.documentOptions.margin.left.pfdPoints - this.documentOptions.margin.right.pfdPoints,
      this.textManager);
    await table.writeTable(
      this.documentOptions.margin.left.pfdPoints,
      this.currentPage.getY(),
      this.lowestY,
      this.currentPage,
      this.textManager,
      this.addPageLikeLast.bind(this)
    );
    this.currentPage.moveTo(this.documentOptions.margin.left.pfdPoints, this.currentPage.getY());
    return;
  }

  public async write(text: string, options: ITextOptions): Promise<void> {
    if (!this.currentPage) {
      await this.newPage();
    }
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
    console.log('adding new page');
    this.currentPage = this.pdfDocument.addPage(pageSize);
    this.currentPage.moveTo(this.documentOptions.margin.left.pfdPoints, this.currentPage.getHeight() - this.documentOptions.margin.top.pfdPoints);
    const defaultFont = await this.textManager.getFont(
      this.documentOptions.defaultFontKey,
      FontStyle.normal);
    this.currentPage.setFont(defaultFont);
    this.currentPage.setFontColor(this.documentOptions.defaultColor);
    if (this.headerImage) {
      console.log('drawing header image');
      const headerImageCoordinates = this.drawCenteredImage(this.headerImage, 0, 'top');
      this.currentPage.moveDown(headerImageCoordinates.height);
      // move one line down below the header
      this.moveDown(1);
    }
    if (this.headerBlock) {
      console.log('move down because of headerBlock');
      this.headerY = this.currentPage.getY();
      this.currentPage.moveDown(this.headerBlock.height);
      this.moveDown(1);
    }

    if (this.footerImage) {
      console.log('drawing footer image');
      const footerImageCoordinates = this.drawCenteredImage(this.footerImage, 0, 'bottom');
      // leave at least one line above the footer image
      this.lowestY = this.documentOptions.margin.bottom.pfdPoints + footerImageCoordinates.height +
        (this.currentTextHeight * this.currentLineHeight);
    } else {
      this.lowestY = this.documentOptions.margin.bottom.pfdPoints + (this.currentTextHeight * this.currentLineHeight);
    }
    if (this.footerBlock) {
      this.footerY = this.lowestY - (this.footerBlock.height * 3 / 4);
      this.lowestY += this.footerBlock.height;
    }
    return this.currentPage;
  }

  private async initializeDocument(options: IDocumentOptions): Promise<void> {
    this.pdfDocument = await PDFDocument.create();
    this.pdfDocument.setAuthor('Johan Bouduin');
    this.pdfDocument.setTitle(options.title);
    this.pdfDocument.setCreator('https://github.com/jbouduin/openproject.electron');
    this.pdfDocument.setProducer('https://github.com/jbouduin/openproject.electron');

    this.textManager = new PdfTextManager(this.documentOptions, this.pdfDocument);
    this.textManager.defineFontSet(
      StandardFonts.TimesRoman,
      StandardFonts.TimesRoman,
      StandardFonts.TimesRomanBold,
      StandardFonts.TimesRomanItalic,
      StandardFonts.TimesRomanBoldItalic);
  }

  private drawCenteredImage(image: PDFImage, y: number, from: 'top' | 'bottom' | 'absolute'): PdfCoordinates {
    const pageSize = this.currentPage.getSize();
    let calculatedWidth: number;
    let calculatedHeight: number;
    let calculatedX: number;
    let calculatedY: number;

    if (pageSize.width - image.width < this.documentOptions.margin.left.pfdPoints + this.documentOptions.margin.right.pfdPoints) {
      const factor = (pageSize.width - this.documentOptions.margin.left.pfdPoints - this.documentOptions.margin.right.pfdPoints) / image.width;
      const scaled = image.scale(factor);
      calculatedX = this.documentOptions.margin.left.pfdPoints;
      calculatedWidth = scaled.width;
      calculatedHeight = scaled.height;
    } else {
      calculatedX = this.documentOptions.margin.left.pfdPoints;
      calculatedWidth = image.width;
      calculatedHeight = image.height;
    }
    switch (from) {
      case 'top': {
        calculatedY = pageSize.height - this.documentOptions.margin.top.pfdPoints - y - calculatedHeight;
        break;
      }
      case 'bottom': {
        calculatedY = this.documentOptions.margin.bottom.pfdPoints + y; // - calculatedHeight;
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

  private async writeText(text: string, options: ITextOptions): Promise<number> {
    let result: number;
    this.currentTextHeight = options.textHeight;
    this.currentLineHeight = options.lineHeight;
    const prepared = await this.textManager.prepareText(
      text,
      options.maxWidth.pfdPoints,
      this.currentTextHeight,
      options.fontKey,
      options.style
    );

    const calculatedOptions = new TextOptions(this.documentOptions);
    calculatedOptions.align = options.align;
    calculatedOptions.color = options.color;
    calculatedOptions.textHeight = this.currentTextHeight;
    calculatedOptions.maxWidth = options.maxWidth;
    // calculatedOptions.wordBreaks = options.wordBreaks;
    calculatedOptions.x = options.x;
    calculatedOptions.y = options.y;
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
