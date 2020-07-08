import { ITableOptions } from "./table-options";
import { IPdfTable } from "./pdf-table";
import { IPdfTableCell, PdfTableCell } from "./pdf-table-cell";

export interface IPdfTableRow {
  readonly isLastRow: boolean;
  readonly options?: ITableOptions;
  cells: Array<IPdfTableCell>;
  table: IPdfTable;
}

export class PdfTableRow implements IPdfTableRow {

  private rowNumber: number;
  private isHeaderRow: boolean;

  public cells: Array<IPdfTableCell>;
  public options?: ITableOptions;
  public table: IPdfTable;

  public get isLastRow(): boolean {
    return this.isHeaderRow ?
      this.rowNumber === this.table.headerRows.keys.length - 1 :
      this.rowNumber === this.table.dataRows.keys.length - 1;
  }

  public constructor(table: IPdfTable, isHeaderRow: boolean, rowNumber: number, options?: ITableOptions) {
    this.options = options;
    this.isHeaderRow = isHeaderRow;
    this.rowNumber = rowNumber;
    this.table = table;
    this.cells = new Array<IPdfTableCell>();
  }

  public addCell(column: number, span: number, value: string, options?: ITableOptions): IPdfTableCell {
    const result = new PdfTableCell(this, this.table.columns.get(column), span, value, options);
    this.cells.push(result);
    return result;
  }
}
