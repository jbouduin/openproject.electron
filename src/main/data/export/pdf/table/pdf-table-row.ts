import { IPdfTextManager } from "../content/pdf-text-manager";
import { PdfStatics } from "../../pdf-statics";
import { IPdfTableCell, PdfTableCell } from "./pdf-table-cell";
import { IInternalPdfTable } from "./pdf-table";
import { PDFPage } from "pdf-lib";
import { IRowOptions } from "../options/row-column.options";
import { ICellOptions, CellOptions } from "../options/cell.options";

export interface IPdfTableRow {
  readonly calculatedHeight: number;
  readonly isLastRow: boolean;
  readonly options?: IRowOptions;
  readonly cells: Array<IPdfTableCell>;
  readonly rowNumber: number;
  addCell(columnName: string, span: number, value: string, options?: ICellOptions): IPdfTableCell;
  cell(column: string | number): IPdfTableCell;
  getCellOptions(columnName: string): ICellOptions;
  prepareRow(textManager: IPdfTextManager): Promise<void>;
  writeRow(x: number, y: number, currentPage: PDFPage, textManager: IPdfTextManager): void;
}

export class PdfTableRow implements IPdfTableRow {

  private isHeaderRow: boolean;
  private table: IInternalPdfTable;

  public calculatedHeight: number;
  public cells: Array<IPdfTableCell>;
  public rowNumber: number;
  public options: IRowOptions;

  public get isLastRow(): boolean {
    return this.isHeaderRow ?
      this.rowNumber === this.table.headerRows.size() - 1 :
      this.rowNumber === this.table.dataRows.size() - 1;
  }

  public constructor(table: IInternalPdfTable, isHeaderRow: boolean, rowNumber: number, options: IRowOptions) {
    this.options = options;
    this.isHeaderRow = isHeaderRow;
    this.rowNumber = rowNumber;
    this.table = table;
    this.cells = new Array<IPdfTableCell>();
  }

  public addCell(columnName: string, span: number, value: string, options?: ICellOptions): IPdfTableCell {
    const column = this.table.column(columnName);
    const result = new PdfTableCell(this, column, span, value, options || this.getCellOptions(columnName));
    this.cells.push(result);
    for (let i = 1; i < span; i++) {
      const spannedCell = new PdfTableCell(this, this.table.column(column.columnNumber + i), 0, undefined, options);
      this.cells.push(spannedCell);
    }
    return result;

  }

  public cell(column: string | number): IPdfTableCell {
    if (PdfStatics.isNumber(column)) {
      return this.cells.filter(cell => cell.columnNumber === column as number)[0];
    } else {
      return this.cells.filter(cell => cell.columnName === column as string)[0];
    }
  }

  public getCellOptions(columnName: string): ICellOptions {
    return new CellOptions(this.options, this.table.column(columnName).options, this.table.tableOptions);
  }

  public async prepareRow(textManager: IPdfTextManager): Promise<void> {
    await Promise.all(this.cells.map(cell => cell.prepareCell(textManager)));
    this.calculatedHeight = this.cells
      .map(cell => cell.calculatedHeight)
      .reduce((prev: number, current: number) => prev = Math.max(prev, current), 0);
    console.log('prepared row', { header: this.isHeaderRow, row: this.rowNumber, calculatedHeight: this.calculatedHeight});
  }

  public writeRow(x: number, y: number, currentPage: PDFPage, textManager: IPdfTextManager): void {
    this.cells.forEach(cell => cell.writeCell(x, y, currentPage, textManager));
  }
}
