import { ITableOptions } from "./table-options";
import { IPdfTable } from "./pdf-table";
import { PdfConstants } from "./pdf-constants";

export interface IPdfTableColumn {
  readonly isLastColumn: boolean;
  // XXX get rid of the next interface member, it is too large
  readonly options: ITableOptions;
  readonly columnName: string;
  readonly columnNumber: number
  readonly maxWidth?: number;
  readonly table: IPdfTable;
  /**
   * the calculated width of the column that will be used to draw the table
   */
  calculatedWidth: number;
  /**
  * the x-coordinate off the column relative to the utter left of the table
  */
  offsetX: number;

}

export class PdfTableColumn implements IPdfTableColumn {
  private _options?: ITableOptions;
  public columnName: string;
  public columnNumber: number;
  public calculatedWidth: number;
  public offsetX: number;
  public table: IPdfTable;

  public get isLastColumn(): boolean {
    return this.columnNumber === this.table.columns.size() - 1;
  }

  public get maxWidth(): number {
    return this._options?.maxWidth;
  }

  public get options(): ITableOptions {
    if (this._options) {
      const result = this._options.clone();
      // if there is a local value: use it
      // if not: use the value from the table
      result.style = result.style || this.table.options.style
      result.color = result.color || this.table.options.color;
      result.fontKey = result.fontKey || this.table.options.fontKey;
      result.size = result.size || this.table.options.size;
      result.lineHeight = result.lineHeight || this.table.options.lineHeight;
      result.maxWidth = result.maxWidth || this.table.options.maxWidth;
      // TODO result.wordBreaks - currently just accept the default
      result.borderColor = result.borderColor || this.table.options.borderColor;
      result.margin.overrideDefaults(this.table.options.margin, PdfConstants.defaultTableMargin);
      result.borderThickness.overrideDefaults(this.table.options.borderThickness, PdfConstants.defaultTableBorderThickness);
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
