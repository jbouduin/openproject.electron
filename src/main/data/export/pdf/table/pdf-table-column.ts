import { IInternalPdfTable } from "./pdf-table";
import { IColumnOptions } from "../options/row-column.options";

export interface IPdfTableColumn {

  /**
  * the calculated width of the column that will be used to draw the table
  */
  calculatedWidth: number;
  readonly columnName: string;
  readonly columnNumber: number
  readonly isLastColumn: boolean;
  readonly options: IColumnOptions;
  readonly maxWidth?: number;
  /**
  * the x-coordinate off the column relative to the utter left of the table
  */
  offsetX: number;

}

export class PdfTableColumn implements IPdfTableColumn {
  private table: IInternalPdfTable;

  public columnName: string;
  public columnNumber: number;
  public calculatedWidth: number;
  public offsetX: number;
  public options: IColumnOptions;

  public get isLastColumn(): boolean {
    return this.columnNumber === this.table.columns.size() - 1;
  }

  public get maxWidth(): number {
    return this.options.maxWidth?.pfdPoints;
  }

  public constructor(table: IInternalPdfTable, columnNumber: number, columnName: string, options: IColumnOptions) {
    this.options = options;
    this.columnNumber = columnNumber;
    this.columnName = columnName;
    this.table = table;
  }
}
