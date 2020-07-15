import { ITableOptions } from "./table-options";
import { IPdfTable } from "./pdf-table";
import { IPdfTableCell, PdfTableCell } from "./pdf-table-cell";
import { PdfStatics } from "./pdf-statics";
import { IPdfTextManager } from "./pdf-text-manager";
import { PDFPage } from "pdf-lib";

export interface IPdfTableRow {
  readonly calculatedHeight: number;
  readonly isLastRow: boolean;
  readonly options?: ITableOptions;
  readonly cells: Array<IPdfTableCell>;
  readonly rowNumber: number;
  addCell(columnName: string, span: number, value: string, options?: ITableOptions): IPdfTableCell;
  cell(column: string | number): IPdfTableCell;
  prepareRow(textManager: IPdfTextManager): Promise<void>;
  writeRow(x: number, y: number, currentPage: PDFPage, textManager: IPdfTextManager): void;
}

export class PdfTableRow implements IPdfTableRow {

  private isHeaderRow: boolean;
  private table: IPdfTable;

  public calculatedHeight: number;
  public cells: Array<IPdfTableCell>;
  public rowNumber: number;
  public options?: ITableOptions;

  public get isLastRow(): boolean {
    return this.isHeaderRow ?
      this.rowNumber === this.table.headerRows.size() - 1 :
      this.rowNumber === this.table.dataRows.size() - 1;
  }

  public constructor(table: IPdfTable, isHeaderRow: boolean, rowNumber: number, options?: ITableOptions) {
    this.options = options;
    this.isHeaderRow = isHeaderRow;
    this.rowNumber = rowNumber;
    this.table = table;
    this.cells = new Array<IPdfTableCell>();
  }

  public addCell(columnName: string, span: number, value: string, options?: ITableOptions): IPdfTableCell {
    const result = new PdfTableCell(this, this.table.columns.getValue(columnName), span, value, options);
    this.cells.push(result);
    return result;
  }

  public cell(column: string | number): IPdfTableCell {
    if (PdfStatics.isNumber(column)) {
      return this.cells.filter(cell => cell.columnNumber === column as number)[0];
    } else {
      return this.cells.filter(cell => cell.columnName === column as string)[0];
    }
  }

  public async prepareRow(textManager: IPdfTextManager): Promise<void> {
    await Promise.all(this.cells.map(cell => cell.prepareCell(textManager)));
    this.calculatedHeight = this.cells
      .map(cell => cell.calculatedHeight)
      .reduce((prev: number, current: number) => prev = Math.max(prev, current), 0);
    console.log({ header: this.isHeaderRow, row: this.rowNumber, calculatedHeight: this.calculatedHeight});
  }

  public writeRow(x: number, y: number, currentPage: PDFPage, textManager: IPdfTextManager): void {
    this.cells.forEach(cell => cell.writeCell(x, y, currentPage, textManager));
  }
}
