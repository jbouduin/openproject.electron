import * as Collections from 'typescript-collections';
import { TableOptions } from "./table-options";
import { IPdfTableColumn, PdfTableColumn } from "./pdf-table-column";
import { IPdfTableRow, PdfTableRow } from "./pdf-table-row";

export interface IPdfTable {
  options: TableOptions;
  columns: Collections.Dictionary<string, IPdfTableColumn>;
  dataRows: Collections.Dictionary<number, IPdfTableRow>;
  headerRows: Collections.Dictionary<number, IPdfTableRow>;
  addColumn(columnName: string, options?: TableOptions): IPdfTableColumn;
  addHeaderRow(options?: TableOptions): IPdfTableRow;
  addDataRow(options?: TableOptions): IPdfTableRow;
}

export class PdfTable implements IPdfTable {


  public options: TableOptions;
  public columns: Collections.Dictionary<string, IPdfTableColumn>;
  public dataRows: Collections.Dictionary<number, IPdfTableRow>;
  public headerRows: Collections.Dictionary<number, IPdfTableRow>;

  public constructor(options: TableOptions) {
    this.options = options;
    this.columns = new Collections.Dictionary<string, IPdfTableColumn>();
    this.dataRows = new Collections.Dictionary<number, IPdfTableRow>();
    this.headerRows = new Collections.Dictionary<number, IPdfTableRow>();
  }

  public addColumn(columnName?: string, options?: TableOptions): IPdfTableColumn {
    const result = new PdfTableColumn(this, this.columns.size(), options);
    this.columns.setValue(columnName, result);
    return result;
  }

  public addDataRow(options?: TableOptions): IPdfTableRow {
    const result = new PdfTableRow(this, false, this.dataRows.size(), options);
    this.dataRows.setValue(this.dataRows.size(), result);
    return result;
  }

  public addHeaderRow(options?: TableOptions): IPdfTableRow {
    const result = new PdfTableRow(this, true, this.headerRows.size(), options);
    this.headerRows.setValue(this.headerRows.size(), result);
    return result;
  }
}
