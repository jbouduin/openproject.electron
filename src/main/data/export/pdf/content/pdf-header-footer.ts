import { PDFPage } from "pdf-lib";
import { IWriteTextOptions } from "../options/write-text.options";
import { PdfUnit, IPdfUnit } from "../size/pdf-unit";
import { PdfStatics } from "../pdf-statics";
import { IPdfTextManager } from "./pdf-text-manager";
import { IPdfHeaderFooterFields } from "./pdf-header-footer-fields";

export interface IPdfHeaderFooter {
  left?: string;
  center?: string;
  right?: string;
  image?: string;
  readonly height: number;
  setMaxWidth(value: IPdfUnit): void;
  setX(value: number): void;
  write(y: number, currentPage: PDFPage, textManager: IPdfTextManager, fields: IPdfHeaderFooterFields): Promise<void>;
}

export class PdfHeaderFooter implements IPdfHeaderFooter {
  private options: IWriteTextOptions;

  public left?: string;
  public center?: string;
  public right?: string;
  public image?: string;

  public get height(): number {
    return (this.options.lineHeight || PdfStatics.defaultLineHeight) *
      (this.options.textHeight || PdfStatics.defaultTextHeight);
  }

  public constructor(options: IWriteTextOptions) {
    this.options = options;
  }

  public setMaxWidth(value: IPdfUnit): void {
    this.options.maxWidth = value;
  }

  public setX(value: number): void {
    this.options.x = new PdfUnit(`${value} pt`);
  }

  public async write(y: number, currentPage: PDFPage, textManager: IPdfTextManager, fields: IPdfHeaderFooterFields): Promise<void> {
    let left: string;
    let center: string;
    let right: string;
    if (this.left) { left = this.fillFields(this.left, fields); }
    if (this.center) { center = this.fillFields(this.center, fields); }
    if (this.right) { right = this.fillFields(this.right, fields); }

    this.options.y = new PdfUnit(`${y} pt`);
    // header and footer are single line, so we call prepare text only to get the font we need
    const prepared = await textManager.prepareText(
      this.left || this.right || this.center,
      this.options.maxWidth.pfdPoints,
      this.options.textHeight,
      this.options.fontKey,
      this.options.style);
    if (this.left) {
      this.options.align = 'left';
      textManager.writeTextLine(left, currentPage, prepared.font, this.options);
    }
    if (this.center) {
      this.options.align = 'center';
      textManager.writeTextLine(center, currentPage, prepared.font, this.options);
    }
    if (this.right) {
      this.options.align = 'right';
      textManager.writeTextLine(right, currentPage, prepared.font, this.options);
    }
  }

  private fillFields(part: string, fields: IPdfHeaderFooterFields): string {
    return part.replace('{{author}}', fields.author)
      .replace('{{date}}', Intl.DateTimeFormat('de-DE').format(fields.date))
      .replace('{{pageNumber}}', fields.pageNumber.toString())
      .replace('{{title}}', fields.title)
      .replace('{{totalPages}}', fields.totalPages.toString())
  }
}
