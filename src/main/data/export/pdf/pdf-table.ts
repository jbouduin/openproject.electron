import { TableOptions } from "./table-options";
import { IPdfTableColumn, PdfTableColumn } from "./pdf-table-column";
import { IPdfTableRow, PdfTableRow } from "./pdf-table-row";

export interface IPdfTable {
  options: TableOptions;
  columns: Map<number, IPdfTableColumn>;
  dataRows: Map<number, IPdfTableRow>;
  headerRows: Map<number, IPdfTableRow>;
  addColumn(options: TableOptions): IPdfTableColumn;
  addHeaderRow(options: TableOptions): IPdfTableRow;
  addDataRow(options: TableOptions): IPdfTableRow;
}

export class PdfTable implements IPdfTable {

  public options: TableOptions;
  public columns: Map<number, IPdfTableColumn>;
  public dataRows: Map<number, IPdfTableRow>;
  public headerRows: Map<number, IPdfTableRow>;

  public constructor(options: TableOptions) {
    this.options = options;
    this.columns = new Map<number, IPdfTableColumn>();
    this.dataRows = new Map<number, IPdfTableRow>();
    this.headerRows = new Map<number, IPdfTableRow>();
  }

  public addColumn(options: TableOptions): IPdfTableColumn {
    const result = new PdfTableColumn(this, this.columns.keys.length - 1, options);
    this.columns.set(this.columns.keys.length, result);
    return result;
  }

  public addDataRow(options: TableOptions): IPdfTableRow {
    const result = new PdfTableRow(this, false, this.dataRows.keys.length - 1, options);
    this.dataRows.set(this.dataRows.keys.length, result);
    return result;
  }

  public addHeaderRow(options: TableOptions): IPdfTableRow {
    const result = new PdfTableRow(this, true, this.headerRows.keys.length - 1, options);
    this.headerRows.set(this.headerRows.keys.length, result);
    return result;
  }
}
