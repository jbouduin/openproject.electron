import { IWriteTextOptions } from "./write-text.options";
import { IPdfTextManager } from "./pdf-text-manager";
import { IPdfHeaderFooterFields } from "./pdf-header-footer-fields";
import { PDFPage } from "pdf-lib";
import { PdfConstants } from "./pdf-constants";

export interface IPdfHeaderFooter {
  left?: string;
  center?: string;
  right?: string;
  readonly height: number;
  setMaxWidth(value: number): void;
  setX(value: number): void;
  write(y: number, currentPage: PDFPage, textManager: IPdfTextManager, fields: IPdfHeaderFooterFields): Promise<void>;
}


export class PdfHeaderFooter implements IPdfHeaderFooter {
  private options: IWriteTextOptions;

  public left?: string;
  public center?: string;
  public right?: string;

  public get height(): number {
    return (this.options.lineHeight || PdfConstants.defaultLineHeight) *
      (this.options.textHeight || PdfConstants.defaultTextHeight);
  }

  public constructor(options: IWriteTextOptions) {
    this.options = options;
  }

  public setMaxWidth(value: number): void {
    this.options.maxWidth = value;
  }

  public setX(value: number): void {
    this.options.x = value;
  }

  public async write(y: number, currentPage: PDFPage, textManager: IPdfTextManager, fields: IPdfHeaderFooterFields): Promise<void> {
    if (this.left) { this.left = this.fillFields(this.left, fields); }
    if (this.center) { this.center = this.fillFields(this.center, fields); }
    if (this.right) { this.right = this.fillFields(this.right, fields); }

    this.options.y = y;
    // header and footer are single line, so we call prepare text only to get the font we need
    const prepared = await textManager.prepareText(
      this.left || this.right || this.center,
      this.options.maxWidth,
      this.options.textHeight,
      this.options.fontKey,
      this.options.style);
    if (this.left) {
      this.options.align = 'left';
      textManager.writeTextLine(this.left, currentPage, prepared.font, this.options);
    }
    if (this.center) {
      this.options.align = 'center';
      textManager.writeTextLine(this.center, currentPage, prepared.font, this.options);
    }
    if (this.right) {
      this.options.align = 'right';
      textManager.writeTextLine(this.right, currentPage, prepared.font, this.options);
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
