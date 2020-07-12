import { ITableOptions, TableOptions } from "./table-options";
import { IPdfTableRow } from "./pdf-table-row";
import { IPdfTableColumn } from "./pdf-table-column";
import { PdfConstants } from "./pdf-constants";
import { IPdfTextManager } from "./pdf-text-manager";
import { StandardFonts, PDFFont, PDFPage } from "pdf-lib";
import { FontStyle } from "./font-style";

export interface IPdfTableCell {
  readonly options: ITableOptions;
  readonly calculatedHeight: number;
  column: IPdfTableColumn;
  row: IPdfTableRow;
  value: string;
  prepareCell(textManager: IPdfTextManager): Promise<void>;
  writeCell(x: number, y: number, currentPage: PDFPage, textManager: IPdfTextManager): void;
}

export class PdfTableCell implements IPdfTableCell {
  private _options?: ITableOptions;

  public column: IPdfTableColumn;
  public row: IPdfTableRow;
  public span: number;
  public value: string;
  public calculatedHeight: number;
  private calculatedFont: PDFFont;
  private text: Array<string> | string;

  public get adress(): [number, number] {
    return [this.row.rowNumber, this.column.columnNumber];
  }

  public get options(): ITableOptions {

    const result = this._options ? this._options.clone() : new TableOptions();
    // if there is a local value: use it
    // if not: use the value from the row, if the row has one
    // if not: use the value from the column, which will give the table wide value if there is no column value
    result.style = result.style || this.row.options?.style || this.column.options.style
    result.color = result.color || this.row.options?.color || this.column.options.color;
    result.fontKey = result.fontKey || this.row.options?.fontKey || this.column.options.fontKey;
    result.size = result.size || this.row.options?.size || this.column.options.size;
    result.lineHeight = result.lineHeight || this.row.options?.lineHeight || this.column.options.lineHeight;
    result.maxWidth = result.maxWidth || this.row.options?.maxWidth || this.column.options.maxWidth;
    // TODO result.wordBreaks - currently just accept the default
    result.borderColor = result.borderColor || this.row.options?.borderColor || this.column.options.borderColor;
    if (this.row.options) {
      result.margin.overrideDefaults(this.row.options.margin, PdfConstants.defaultTableMargin);
    }
    result.margin.overrideDefaults(this.column.options.margin, PdfConstants.defaultTableMargin);
    if (this.row.options) {
      result.borderThickness.overrideDefaults(this.row.options.borderThickness, PdfConstants.defaultTableBorderThickness);
    }
    result.borderThickness.overrideDefaults(this.column.options.borderThickness, PdfConstants.defaultTableBorderThickness);
    return result;
  }

  public constructor(row: IPdfTableRow, column: IPdfTableColumn, span: number, value: string, options?: ITableOptions) {
    this._options = options;
    this.row = row;
    this.column = column;
    this.span = span;
    this.value = value;
  }

  public async prepareCell(textManager: IPdfTextManager): Promise<void> {
    // calculate the available Width for writing
    let calculatedWidth: number;
    if (this.span === 1) {
      calculatedWidth = this.column.calculatedWidth - this.options.margin.left - this.options.margin.right;
    } else {
      calculatedWidth = this.column.calculatedWidth - this._options.margin.left;
      for (let i = 1; i < this.span - 1; i++) {
        calculatedWidth += this.row.cell(this.column.columnNumber + i).column.calculatedWidth;
      }
      calculatedWidth += this.row.cell(this.column.columnNumber + this.span).column.calculatedWidth -
        this.row.cell(this.column.columnNumber + this.span).options.margin.right;
    }

    // calculate the lines of text that will be written
    const sizeToUse = this.options.size || PdfConstants.defaultFontSize;
    const lineHeightToUse = this.options.lineHeight || PdfConstants.defaultLineHeight;
    const prepared = await textManager.prepareText(
      this.value,
      sizeToUse,
      this.options.fontKey || StandardFonts.TimesRoman,
      this.options.style || FontStyle.normal,
      calculatedWidth
    );
    this.calculatedFont = prepared.font;
    this.text = prepared.text;
    // calculate the height of the cell (top border to bottom border)
    if (Array.isArray(this.text)) {
      this.calculatedHeight = this.text.length * sizeToUse * lineHeightToUse;
    } else {
      this.calculatedHeight = sizeToUse * lineHeightToUse;
    }
    this.calculatedHeight += this.options.margin.top + this.options.margin.bottom;
  }

  public writeCell(x: number, y: number, currentPage: PDFPage, textManager: IPdfTextManager): void {

    const options = this.options;
    options.x = x + this.column.offsetX + this.options.margin.left;
    options.y = y;
    options.size = options.size || PdfConstants.defaultFontSize;
    options.lineHeight = options.lineHeight || PdfConstants.defaultLineHeight;
    const lineY = y + (options.lineHeight * options.size);
    if (Array.isArray(this.text)) {
      this.text.forEach( (line: string) => {
        textManager.writeTextLine(line, currentPage, this.calculatedFont, options);
        options.y -= (options.size * options.lineHeight);
      });
    } else {
      textManager.writeTextLine(this.text as string, currentPage, this.calculatedFont, options);
    }
    currentPage.drawLine({
      start: { x: x + this.column.offsetX, y: lineY },
      end: { x: x + this.column.offsetX + this.column.calculatedWidth, y: lineY },
      thickness: 1,
      color: options.color || PdfConstants.defaultColor
    });

    currentPage.drawLine({
      start: { x: x + this.column.offsetX + this.column.calculatedWidth, y: lineY },
      end: { x: x + this.column.offsetX + this.column.calculatedWidth, y: lineY - this.row.calculatedHeight },
      thickness: 1,
      color: options.color || PdfConstants.defaultColor
    });

    currentPage.drawLine({
      start: { x: x + this.column.offsetX, y: lineY - this.row.calculatedHeight},
      end: { x: x + this.column.offsetX + this.column.calculatedWidth, y: lineY - this.row.calculatedHeight },
      thickness: 1,
      color: options.color || PdfConstants.defaultColor
    });

    currentPage.drawLine({
      start: { x: x + this.column.offsetX, y: lineY },
      end: { x: x + this.column.offsetX, y: lineY - this.row.calculatedHeight },
      thickness: 1,
      color: options.color || PdfConstants.defaultColor
    });

  }
}
