import { PDFPage } from "pdf-lib";
import { IDocumentOptions } from "../options/document.options";
import { ITextOptions } from "../options/text.options";
import { PdfUnit } from "../size/pdf-unit";
import { IPdfTextManager } from "./pdf-text-manager";
import { IPdfHeaderFooterFields } from "./pdf-header-footer-fields";

export interface IPdfHeaderFooter {
  left?: string;
  center?: string;
  right?: string;
  readonly height: number;
  write(y: number, currentPage: PDFPage, textManager: IPdfTextManager, fields: IPdfHeaderFooterFields): Promise<void>;
}

export class PdfHeaderFooter implements IPdfHeaderFooter {
  private documentOptions: IDocumentOptions;
  private textOptions: ITextOptions;

  public center?: string;
  public left?: string;
  public right?: string;

  public get height(): number {
    return (this.textOptions.lineHeight || this.documentOptions.defaultLineHeight) *
      (this.textOptions.textHeight || this.documentOptions.defaultTextHeight);
  }

  public constructor(documentOptions: IDocumentOptions, textOptions: ITextOptions) {
    this.documentOptions = documentOptions;
    this.textOptions = textOptions;
  }

  public async write(y: number, currentPage: PDFPage, textManager: IPdfTextManager, fields: IPdfHeaderFooterFields): Promise<void> {
    let left: string;
    let center: string;
    let right: string;
    if (this.left) { left = this.fillFields(this.left, fields); }
    if (this.center) { center = this.fillFields(this.center, fields); }
    if (this.right) { right = this.fillFields(this.right, fields); }

    this.textOptions.y = new PdfUnit(`${y} pt`);
    // header and footer are single line, so we call prepare text only to get the font we need
    const prepared = await textManager.prepareText(
      this.left || this.right || this.center,
      this.textOptions.maxWidth.pfdPoints,
      this.textOptions.textHeight,
      this.textOptions.fontKey,
      this.textOptions.style);
    if (this.left) {
      this.textOptions.align = 'left';
      textManager.writeTextLine(left, currentPage, prepared.font, this.textOptions);
    }
    if (this.center) {
      this.textOptions.align = 'center';
      textManager.writeTextLine(center, currentPage, prepared.font, this.textOptions);
    }
    if (this.right) {
      this.textOptions.align = 'right';
      textManager.writeTextLine(right, currentPage, prepared.font, this.textOptions);
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
