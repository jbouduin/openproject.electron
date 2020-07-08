import { ITableOptions, TableOptions } from "./table-options";
import { IPdfTableRow } from "./pdf-table-row";
import { IPdfTableColumn } from "./pdf-table-column";
import { PdfConstants } from "./pdf-constants";

export interface IPdfTableCell {
  readonly options: ITableOptions;
  column: IPdfTableColumn;
  row: IPdfTableRow;
  value: string;
}

export class PdfTableCell implements IPdfTableCell {
  private _options?: ITableOptions;

  public column: IPdfTableColumn;
  public row: IPdfTableRow;
  public span: number;
  public value: string;

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
}
