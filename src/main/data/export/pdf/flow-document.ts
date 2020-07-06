import * as fs from 'fs';
import { PDFDocument, PDFPage, PDFImage, StandardFonts, PDFFont, rgb } from "pdf-lib";
import { CreateParams } from "./create.params";
import { shell } from 'electron';

// Remark: sizes are in pdfPoints
// 1 inch = 72 points
// 1 inch = 25.4 mm
// 1 point = 0.352777778 mm
// 15 mm = 42.52 points (approx)
// 10 mm = 28.35 points (approx)

interface Coordinates {
  x: number;
  y: number;
  width: number;
  height: number
}

export class FlowDocument {

  private pdfDocument: PDFDocument;
  private currentPage: PDFPage | undefined;
  private headerImage: PDFImage | undefined;
  private footerImage: PDFImage | undefined;
  private defaultFont: PDFFont;
  private defaultFontSize: number;
  private defaultLineHeight: number;
  private currentFontSize: number;
  private currentLineHeight: number;
  private boldFont: PDFFont;
  private marginTop: number;
  private marginBottom: number;
  private marginLeft: number;
  private marginRight: number;
  private pageSize: [number, number];
  private currentY: number;
  private remainingHeight: number;

  public constructor(params: CreateParams) {
    this.pageSize = params.pageSize;
    this.defaultFontSize = 12; // fonts are in points, so no conversion is required
    this.defaultLineHeight = 1.15;
    this.currentFontSize = this.defaultFontSize;
    this.currentLineHeight = this.defaultLineHeight;
    this.marginTop = this.millimeterToPdfPoints(params.marginTop);
    this.marginBottom = this.millimeterToPdfPoints(params.marginBottom);
    this.marginLeft = this.millimeterToPdfPoints(params.marginLeft);
    this.marginRight = this.millimeterToPdfPoints(params.marginRight);
    this.currentPage = undefined;
  }

  public static async createDocument(params: CreateParams): Promise<FlowDocument> {
    const result = new FlowDocument(params);
    await result.initializeDocument(params);
    return result;
  }

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

  public async moveDown(lines?: number): Promise<boolean> {
    if (!lines) {
      lines = 1;
    }
    const toMove = lines * this.currentLineHeight * this.currentFontSize;
    if (!this.currentPage || toMove > this.remainingHeight) {
      await this.addPage();
      return true;
    } else {
      this.currentY -= toMove;
      this.remainingHeight -= toMove
      return false;
    }
  }

  public write(text: string, size?: number, style?: 'bold' | 'regular'): void {
    const sizeToUse =  size || this.defaultFontSize
    const fontToUse = style === 'bold' ? this.boldFont : this.defaultFont;
    const textSize = fontToUse.sizeAtHeight(sizeToUse);
    const textWidth = fontToUse.widthOfTextAtSize(text, textSize);
    // breakTextIntoLines()
    this.currentPage.drawText(text, {
      wordBreaks: [' '],
      size: textSize,
      font: fontToUse,
      x: (this.currentPage.getWidth() - textWidth) / 2,
      y: this.currentY,
      maxWidth: this.currentPage.getWidth() - this.marginLeft - this.marginRight
    });

  }

  private async loadImage(fullPath: string): Promise<PDFImage> {
    const img = await fs.promises.readFile(fullPath);
    return this.pdfDocument.embedPng(img);
  }

  private async addPage(): Promise<void> {
    this.currentPage = this.pdfDocument.addPage(this.pageSize);
    this.currentY = this.currentPage.getHeight() - this.marginTop;
    this.remainingHeight = this.currentY - this.marginBottom;
    this.currentPage.setFont(this.defaultFont);
    this.currentPage.setFontColor(rgb(0.25, 0.25, 0.25));
    if (this.headerImage) {
      const headerImageCoordinates = this.drawCenteredImage(this.headerImage, 0, 'top');
      this.currentY -= headerImageCoordinates.height;
      this.remainingHeight -= headerImageCoordinates.height;
    }
    if (this.footerImage) {
      const footerImageCoordinates = this.drawCenteredImage(this.footerImage, 0, 'bottom');
      this.remainingHeight -= footerImageCoordinates.height;
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
    this.defaultFont = await this.pdfDocument.embedFont(StandardFonts.TimesRoman);
    this.boldFont = await this.pdfDocument.embedFont(StandardFonts.TimesRomanBold);
  }

  private drawCenteredImage(image: PDFImage, y: number, from: 'top' | 'bottom' | 'absolute'): Coordinates {
    const pageSize = this.currentPage.getSize();
    let calculatedWidth: number;
    let calculatedHeight: number;
    let calculatedX: number;
    let calculatedY: number;

    if (pageSize.width - image.width < this.marginLeft + this.marginRight) {
      const factor = (pageSize.width - this.marginLeft - this.marginRight) / image.width;
      const scaled = image.scale(factor);
      calculatedX = this.marginLeft;
      calculatedWidth = scaled.width;
      calculatedHeight = scaled.height;
    } else {
      calculatedX = this.marginLeft;
      calculatedWidth = image.width;
      calculatedHeight = image.height;
    }
    switch (from) {
      case 'top': {
        calculatedY = pageSize.height - this.marginTop - y - calculatedHeight;
        break;
      }
      case 'bottom': {
        calculatedY = this.marginBottom + y; // - calculatedHeight;
        break;
      }
      case 'absolute': {
        calculatedY = y;
        break;
      }
    }
    const result: Coordinates = {
      x: calculatedX,
      y: calculatedY,
      width: calculatedWidth,
      height: calculatedHeight
    };
    this.drawImage(image, result);
    return result;
  }

  private drawImage(image: PDFImage, coordinates: Coordinates): void {
    this.currentPage.drawImage(image, coordinates);

  }

  private millimeterToPdfPoints(millimeter: number): number {
    return millimeter / 0.352777778;
  }
}
