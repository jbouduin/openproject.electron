import { PDFFont, PDFPage } from "pdf-lib";
import { IPdfTextManager } from "../content/pdf-text-manager";
import { ITableOptions, TableOptions } from "../options/table.options";
import { IFourSides } from "../size/four-sides";
import { PdfUnit, IPdfUnit } from "../size/pdf-unit";
import { PdfStatics } from "../pdf-statics";
import { IPdfTableColumn } from "./pdf-table-column";
import { IPdfTableRow } from "./pdf-table-row";

export interface IPdfTableCell {

  readonly cellMargin: IFourSides<IPdfUnit>;
  readonly calculatedHeight: number;
  readonly calculatedWidth: number;
  readonly columnName: string;
  readonly columnNumber: number;

  prepareCell(textManager: IPdfTextManager): Promise<void>;
  writeCell(x: number, y: number, currentPage: PDFPage, textManager: IPdfTextManager): void;
}

export class PdfTableCell implements IPdfTableCell {
  private _options?: ITableOptions;
  private calculatedFont: PDFFont;
  private text: Array<string> | string;

  public column: IPdfTableColumn;
  public row: IPdfTableRow;
  public span: number;
  public value: string;
  public calculatedHeight: number;
  public calculatedMaxWidth: number;
  public calculatedRightMargin: number;

  public get adress(): [number, number] {
    return [this.row.rowNumber, this.column.columnNumber];
  }

  public get calculatedWidth(): number {
    return this.column.calculatedWidth;
  }

  public get columnName(): string {
    return this.column.columnName;
  }

  public get columnNumber(): number {
    return this.column.columnNumber;
  }

  public get cellMargin(): IFourSides<IPdfUnit> {
    return this._options.cellMargin;
  }

  private get options(): ITableOptions {

    const result = this._options ? this._options.clone() : new TableOptions();
    // if there is a local value: use it
    // if not: use the value from the row, if the row has one
    // if not: use the value from the column, which will give the table wide value if there is no column value
    result.style = result.style || this.row.options?.style || this.column.options.style
    result.color = result.color || this.row.options?.color || this.column.options.color;
    result.fontKey = result.fontKey || this.row.options?.fontKey || this.column.options.fontKey;
    result.textHeight = result.textHeight || this.row.options?.textHeight || this.column.options.textHeight;
    result.lineHeight = result.lineHeight || this.row.options?.lineHeight || this.column.options.lineHeight;
    result.maxWidth = result.maxWidth || this.row.options?.maxWidth || new PdfUnit(`${this.column.calculatedWidth} pt`);
    // #1188 result.wordBreaks - currently just accept the default
    result.borderColor = result.borderColor || this.row.options?.borderColor || this.column.options.borderColor;
    if (this.row.options) {
      result.cellMargin.overrideDefaults(this.row.options.cellMargin, PdfStatics.defaultTableCellMargin);
    }
    result.cellMargin.overrideDefaults(this.column.options.cellMargin, PdfStatics.defaultTableCellMargin);
    if (this.row.options) {
      result.borderThickness.overrideDefaults(
        this.row.options.borderThickness,
        PdfStatics.defaultTableBorderThickness,
        (x,y) => x.pfdPoints === y.pfdPoints
      );
    }
    result.borderThickness.overrideDefaults(
      this.column.options.borderThickness,
      PdfStatics.defaultTableBorderThickness,
      (x,y) => x.pfdPoints === y.pfdPoints
    );
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
    const myOptions = this.options;
    let calculatedWidth: number;
    switch (this.span) {
      case 0: {
        this.calculatedHeight = 0;
        this.calculatedMaxWidth = 0;
        this.calculatedRightMargin = 0;
        return;
      }
      case 1: {
        calculatedWidth = this.column.calculatedWidth - myOptions.cellMargin.left.pfdPoints - myOptions.cellMargin.right.pfdPoints;
        this.calculatedMaxWidth = this.column.calculatedWidth;
        this.calculatedRightMargin = myOptions.cellMargin.right.pfdPoints;
        break;
      }
      default: {
        let spannedCell: IPdfTableCell;
        calculatedWidth = this.column.calculatedWidth - myOptions.cellMargin.left.pfdPoints;
        this.calculatedMaxWidth = this.column.calculatedWidth;
        for (let i = 1; i < this.span - 1; i++) {
          spannedCell = this.row.cell(this.column.columnNumber + i);
          calculatedWidth += spannedCell.calculatedWidth;
          this.calculatedMaxWidth += spannedCell.calculatedWidth;
        }
        spannedCell = this.row.cell(this.column.columnNumber + this.span - 1)
        calculatedWidth +=
          spannedCell.calculatedWidth -
          this.row.cell(this.column.columnNumber + this.span - 1).cellMargin.right.pfdPoints;
        this.calculatedMaxWidth +=
          spannedCell.calculatedWidth -
          myOptions.cellMargin.left.pfdPoints -
          spannedCell.cellMargin.right.pfdPoints;
      }
    }

    // calculate the lines of text that will be written
    const sizeToUse = this.options.textHeight || PdfStatics.defaultTextHeight;
    const lineHeightToUse = this.options.lineHeight || PdfStatics.defaultLineHeight;
    const prepared = await textManager.prepareText(
      this.value,
      calculatedWidth,
      sizeToUse,
      this.options.fontKey,
      this.options.style
    );
    this.calculatedFont = prepared.font;
    this.text = prepared.text;
    // calculate the height of the cell (top border to bottom border)
    if (Array.isArray(this.text)) {
      this.calculatedHeight = this.text.length * sizeToUse * lineHeightToUse;
    } else {
      this.calculatedHeight = sizeToUse * lineHeightToUse;
    }
    this.calculatedHeight += this.options.cellMargin.top.pfdPoints + this.options.cellMargin.bottom.pfdPoints;
  }

  public writeCell(x: number, y: number, currentPage: PDFPage, textManager: IPdfTextManager): void {
    const options = this.options;
    options.x = new PdfUnit(`${x + this.column.offsetX + this.options.cellMargin.left.pfdPoints} pt`);
    options.y = new PdfUnit(`${y} pt`);
    options.textHeight = options.textHeight || PdfStatics.defaultTextHeight;
    options.lineHeight = options.lineHeight || PdfStatics.defaultLineHeight;
    options.maxWidth = new PdfUnit(`${this.calculatedMaxWidth} pt`);
    // #1182 refine the calculation of lineY
    const lineY = y + (options.lineHeight * options.textHeight);

    if (this.span !== 0) {
      if (Array.isArray(this.text)) {
        this.text.forEach( (line: string) => {
          textManager.writeTextLine(line, currentPage, this.calculatedFont, options);
          options.y = options.y.subtract(new PdfUnit(`${(options.textHeight * options.lineHeight)} pt`));
        });
      } else {
        textManager.writeTextLine(this.text as string, currentPage, this.calculatedFont, options);
      }
    }
    // #1181 avoid drawing the same border twice (e.g. if left border of cell 1 is the same as right border of cell 0)
    // also: use the table borders on the outside
    // also: round start and end, so that corners are really closed

    // Top border
    if (this.options.borderThickness.top && this.options.borderThickness.top.millimeter > 0) {
      currentPage.drawLine({
        start: {
          x: x + this.column.offsetX,
          y: lineY
        },
        end: {
          x: x + this.column.offsetX + this.column.calculatedWidth,
          y: lineY
        },
        thickness: this.options.borderThickness.top.pfdPoints,
        color: options.color || PdfStatics.defaultColor
      });
    }

    // right border
    if (this.span === 1 && this.options.borderThickness.right && this.options.borderThickness.right.millimeter > 0) {
      currentPage.drawLine({
        start: {
          x: x + this.column.offsetX + this.column.calculatedWidth,
          y: lineY
        },
        end: {
          x: x + this.column.offsetX + this.column.calculatedWidth,
          y: lineY - this.row.calculatedHeight
        },
        thickness: this.options.borderThickness.right.pfdPoints,
        color: options.color || PdfStatics.defaultColor
      });
    }

    // bottom border
    if (this.options.borderThickness.bottom && this.options.borderThickness.bottom.millimeter > 0) {
      currentPage.drawLine({
        start: {
          x: x + this.column.offsetX,
          y: lineY - this.row.calculatedHeight
        },
        end: {
          x: x + this.column.offsetX + this.column.calculatedWidth,
          y: lineY - this.row.calculatedHeight
        },
        thickness: this.options.borderThickness.bottom.pfdPoints,
        color: options.color || PdfStatics.defaultColor
      });
    }

    // left border
    if (this.span === 1 || (this.span >= 1 && this.columnNumber === 0)) {
      if (this.options.borderThickness.left && this.options.borderThickness.left.millimeter > 0) {
        currentPage.drawLine({
          start: {
            x: x + this.column.offsetX,
            y: lineY
          },
          end: {
            x: x + this.column.offsetX,
            y: lineY - this.row.calculatedHeight
          },
          thickness: this.options.borderThickness.left.pfdPoints,
          color: options.color || PdfStatics.defaultColor
        });
      }
    }
  }
}
