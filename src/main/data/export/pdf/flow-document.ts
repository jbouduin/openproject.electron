import { shell } from 'electron';
import * as fs from 'fs';
import { PDFDocument, PDFPage, PDFImage, StandardFonts } from "pdf-lib";
import { CreateDocumentOptions } from "./create-document.options";
import { IWriteTextOptions, WriteTextOptions } from './write-text.options';
import { FontStyle } from './font-style';
import { FourSides } from './four-sides';
import { PdfStatics } from './pdf-statics';
import { PdfCoordinates } from './pdf-coordinates';
import { IPdfTable } from './pdf-table';
import { PdfTextManager, IPdfTextManager } from './pdf-text-manager';
import { IPdfHeaderFooter } from './pdf-header-footer';
import { IPdfHeaderFooterFields } from './pdf-header-footer-fields';
import { IPdfSize } from './pdf-size';
import { IPdfUnit } from './pdf-unit';

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
  writeHeadersAndFooters(fields: IPdfHeaderFooterFields): Promise<void>;
  writeLine(text: string, options: IWriteTextOptions): Promise<void>;
  writeTable(table: IPdfTable): Promise<void>;
  write(text: string, options: IWriteTextOptions): Promise<void>;
}

export class FlowDocument {

  // <editor-fold desc='Private properties'>
  private pdfDocument: PDFDocument;
  private currentPage: PDFPage | undefined;
  private headerImage: PDFImage | undefined;
  private headerBlock: IPdfHeaderFooter | undefined;
  private headerY: number;
  private footerBlock: IPdfHeaderFooter | undefined;
  private footerImage: PDFImage | undefined;
  private footerY: number;
  private textManager: IPdfTextManager;
  private currentTextHeight: number;
  private currentLineHeight: number;
  private margin: FourSides<IPdfUnit>;
  private pageSize: IPdfSize;
  private lowestY: number;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(options: CreateDocumentOptions) {
    this.pageSize = options.pageSize;
    this.currentTextHeight = PdfStatics.defaultTextHeight;
    this.currentLineHeight = PdfStatics.defaultLineHeight;
    this.margin = options.margin;
    this.currentPage = undefined;
  }

  public static async createDocument(options: CreateDocumentOptions): Promise<IFlowDocument> {
    const result = new FlowDocument(options);
    await result.initializeDocument(options);
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
      this.currentPage.moveTo(this.margin.left.pfdPoints, newY);
      result = false;
    }
    return result;
  }

  // #1184 orientaton: 'portrait' | 'landscape'
  // optional input parameter. If not set use document orientation
  // otherwise use the paramter value
  public async newPage(): Promise<void> {
      await this.addPage([ this.pageSize.width.pfdPoints, this.pageSize.height.pfdPoints ]);
    return;
  }

  public async writeHeadersAndFooters(fields: IPdfHeaderFooterFields): Promise<void> {
    if (this.headerBlock || this.footerBlock) {
      fields.totalPages = this.pdfDocument.getPageCount();

      for(let pageIdx = 0; pageIdx < fields.totalPages; pageIdx++) {
        fields.pageNumber = pageIdx + 1;
        const thePage = this.pdfDocument.getPage(pageIdx);
        if (this.headerBlock) {
          // console.log('writing header block @', this.headerY);
          await this.headerBlock.write(this.headerY, thePage, this.textManager, fields);
        }
        if (this.footerBlock) {
          // console.log('writing footer block @', this.footerY);
          await this.footerBlock.write(this.footerY, thePage, this.textManager, fields);
        }
      }
    }
    return;
  }

  public async writeLine(text: string, options: IWriteTextOptions): Promise<void> {
    await this.writeText(text, options);
    await this.moveDown();
    return;
  }

  public async writeTable(table: IPdfTable): Promise<void> {
    await table.prepareTable(
      this.currentPage.getWidth() - this.margin.left.pfdPoints - this.margin.right.pfdPoints,
      this.textManager);
    table.writeTable(
      this.margin.left.pfdPoints,
      this.currentPage.getY(),
      this.lowestY,
      this.currentPage,
      this.textManager,
      this.addPageLikeLast.bind(this)
    );
    this.currentPage.moveTo(this.margin.left.pfdPoints, this.currentPage.getY());
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
    this.currentPage.moveTo(this.margin.left.pfdPoints, this.currentPage.getHeight() - this.margin.top.pfdPoints);
    const defaultFont = await this.textManager.getFont(StandardFonts.TimesRoman, FontStyle.normal);
    this.currentPage.setFont(defaultFont);
    this.currentPage.setFontColor(PdfStatics.defaultColor);
    if (this.headerImage) {
      const headerImageCoordinates = this.drawCenteredImage(this.headerImage, 0, 'top');
      this.currentPage.moveDown(headerImageCoordinates.height);
      // move one line down below the header
      this.moveDown(1);
    }
    if (this.headerBlock) {
      this.headerY = this.currentPage.getY();
      this.currentPage.moveDown(this.headerBlock.height);
      this.moveDown(1);
    }

    if (this.footerImage) {
      const footerImageCoordinates = this.drawCenteredImage(this.footerImage, 0, 'bottom');
      // leave at least one line above the footer image
      this.lowestY = this.margin.bottom.pfdPoints + footerImageCoordinates.height +
        (this.currentTextHeight * this.currentLineHeight);
    } else {
      this.lowestY = this.margin.bottom.pfdPoints + (this.currentTextHeight * this.currentLineHeight);
    }
    if (this.footerBlock) {
      this.footerY = this.lowestY - (this.footerBlock.height * 3 / 4);
      this.lowestY += this.footerBlock.height;
    }
    return this.currentPage;
  }

  private async initializeDocument(options: CreateDocumentOptions): Promise<void> {
    this.pdfDocument = await PDFDocument.create();
    this.pdfDocument.setAuthor('Johan Bouduin');
    this.pdfDocument.setTitle(options.title);
    this.pdfDocument.setCreator('https://github.com/jbouduin/openproject.electron');
    this.pdfDocument.setProducer('https://github.com/jbouduin/openproject.electron');
    if (options.headerImage) {
      this.headerImage = await this.loadImage(options.headerImage);
    }
    if (options.footerImage) {
      this.footerImage = await this.loadImage(options.footerImage);
    }
    if (options.headerBlock) {
      this.headerBlock = options.headerBlock;
      this.headerBlock.setX(this.margin.left.pfdPoints);
      this.headerBlock.setMaxWidth(options.pageSize.width.pfdPoints - this.margin.left.pfdPoints - this.margin.right.pfdPoints);
    }

    if (options.footerBlock) {
      this.footerBlock = options.footerBlock;
      this.footerBlock.setX(this.margin.left.pfdPoints);
      this.footerBlock.setMaxWidth(options.pageSize.width.pfdPoints - this.margin.left.pfdPoints - this.margin.right.pfdPoints);
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

    if (pageSize.width - image.width < this.margin.left.pfdPoints + this.margin.right.pfdPoints) {
      const factor = (pageSize.width - this.margin.left.pfdPoints - this.margin.right.pfdPoints) / image.width;
      const scaled = image.scale(factor);
      calculatedX = this.margin.left.pfdPoints;
      calculatedWidth = scaled.width;
      calculatedHeight = scaled.height;
    } else {
      calculatedX = this.margin.left.pfdPoints;
      calculatedWidth = image.width;
      calculatedHeight = image.height;
    }
    switch (from) {
      case 'top': {
        calculatedY = pageSize.height - this.margin.top.pfdPoints - y - calculatedHeight;
        break;
      }
      case 'bottom': {
        calculatedY = this.margin.bottom.pfdPoints + y; // - calculatedHeight;
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

  private async writeText(text: string, options: IWriteTextOptions): Promise<number> {
    let result: number;
    this.currentTextHeight = options.textHeight || PdfStatics.defaultTextHeight;
    this.currentLineHeight = options.lineHeight || PdfStatics.defaultLineHeight;
    const calculatedMax =
      options.maxWidth ||
      this.currentPage.getWidth() - this.margin.left.pfdPoints - this.margin.right.pfdPoints - (options.x?.pfdPoints || 0);
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
    calculatedOptions.x = options.x ? options.x.add(this.margin.left) : undefined;
    calculatedOptions.y = options.y ? options.y : undefined;
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
