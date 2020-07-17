import { ITableOptions } from "./table-options";
import { IPdfTable } from "./pdf-table";
import { PdfStatics } from "./pdf-statics";

export interface IPdfTableColumn {

  /**
  * the calculated width of the column that will be used to draw the table
  */
  calculatedWidth: number;
  readonly columnName: string;
  readonly columnNumber: number
  readonly isLastColumn: boolean;
  readonly options: ITableOptions;
  readonly maxWidth?: number;
  /**
  * the x-coordinate off the column relative to the utter left of the table
  */
  offsetX: number;

}

export class PdfTableColumn implements IPdfTableColumn {
  private _options?: ITableOptions;
  private table: IPdfTable;

  public columnName: string;
  public columnNumber: number;
  public calculatedWidth: number;
  public offsetX: number;

  public get isLastColumn(): boolean {
    return this.columnNumber === this.table.columns.size() - 1;
  }

  public get maxWidth(): number {
    return this._options?.maxWidth.pfdPoints;
  }

  public get options(): ITableOptions {
    if (this._options) {
      const result = this._options.clone();
      // if there is a local value: use it
      // if not: use the value from the table
      result.style = result.style || this.table.options.style
      result.color = result.color || this.table.options.color;
      result.fontKey = result.fontKey || this.table.options.fontKey;
      result.textHeight = result.textHeight || this.table.options.textHeight;
      result.lineHeight = result.lineHeight || this.table.options.lineHeight;
      result.maxWidth = result.maxWidth || this.table.options.maxWidth;
      // #1188 result.wordBreaks - currently just accept the default
      result.borderColor = result.borderColor || this.table.options.borderColor;
      result.margin.overrideDefaults(this.table.options.margin, PdfStatics.defaultTableMargin);
      result.borderThickness.overrideDefaults(this.table.options.borderThickness, PdfStatics.defaultTableBorderThickness);
      return result;
    } else {
      return this.table.options;
    }
  }

  public constructor(table: IPdfTable, columnNumber: number, columnName: string, options?: ITableOptions) {
    this._options = options;
    this.columnNumber = columnNumber;
    this.columnName = columnName;
    this.table = table;
  }
}
