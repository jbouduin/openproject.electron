import { ITableOptions } from "./table-options";
import { IPdfTable } from "./pdf-table";
import { PdfConstants } from "./pdf-constants";

export interface IPdfTableColumn {
  readonly isLastColumn: boolean;
  readonly options: ITableOptions;

  table: IPdfTable;
}

export class PdfTableColumn implements IPdfTableColumn {
  private _options?: ITableOptions;
  private columnNumber: number;
  // private columnName: string;

  public table: IPdfTable;

  public get isLastColumn(): boolean {
    return this.columnNumber === this.table.columns.size() - 1;
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

  public constructor(table: IPdfTable, columnNumber: number, options?: ITableOptions) {
    this._options = options;
    this.columnNumber = columnNumber;
    // this.columnName = columnName;
    this.table = table;
  }
}
