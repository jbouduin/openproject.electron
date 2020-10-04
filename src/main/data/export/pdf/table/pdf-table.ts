import { PDFPage } from 'pdf-lib';
import * as Collections from 'typescript-collections';
import { IPdfTextManager } from '../content/pdf-text-manager';
import { ITableOptions } from "../options/table.options";
import { PdfStatics } from '../pdf-statics';
import { IPdfTableCell } from './pdf-table-cell';
import { IPdfTableColumn, PdfTableColumn } from "./pdf-table-column";
import { IPdfTableRow, PdfTableRow } from "./pdf-table-row";
import { IColumnOptions, RowColumnOptions, IRowOptions } from '../options/row-column.options';

export interface IPdfTable {
  readonly columnCount: number;
  addColumn(columnName: string, options?: IColumnOptions): IPdfTableColumn;
  addHeaderRow(options?: IRowOptions): IPdfTableRow;
  addDataRow(options?: IRowOptions): IPdfTableRow;
  getColumnOptions(): IColumnOptions;
  getRowOptions(): IRowOptions;
}

export interface IInternalPdfTable extends IPdfTable {
  readonly tableOptions: ITableOptions;
  readonly columns: Collections.Dictionary<string, IPdfTableColumn>;
  readonly dataRows: Collections.Dictionary<number, IPdfTableRow>;
  readonly headerRows: Collections.Dictionary<number, IPdfTableRow>;
  readonly calculatedWidth: number;
  column(column: number | string): IPdfTableColumn;
  dataCell(row: number, column: number | string): IPdfTableCell;
  dataRow(row: number): IPdfTableRow;
  headerCell(row: number, column: number | string): IPdfTableCell;
  headerRow(row: number): IPdfTableRow;
  prepareTable(availableWidth: number, textManager: IPdfTextManager): Promise<void>;
  writeTable(
    x: number,
    y: number,
    lowestY: number,
    currentPage: PDFPage,
    textManager: IPdfTextManager,
    newPageCallBack: () => Promise<PDFPage>): void;
}

export class PdfTable implements IPdfTable, IInternalPdfTable {

  private calculatedHeaderRowHeight: number;

  public tableOptions: ITableOptions;
  public readonly columns: Collections.Dictionary<string, IPdfTableColumn>;
  public readonly dataRows: Collections.Dictionary<number, IPdfTableRow>;
  public readonly headerRows: Collections.Dictionary<number, IPdfTableRow>;
  public calculatedWidth: number;

  public get columnCount(): number {
    return this.columns.size();
  }

  public constructor(options: ITableOptions) {
    this.tableOptions = options;
    this.columns = new Collections.Dictionary<string, IPdfTableColumn>();
    this.dataRows = new Collections.Dictionary<number, IPdfTableRow>();
    this.headerRows = new Collections.Dictionary<number, IPdfTableRow>();
  }

  public addColumn(columnName: string, options?: IColumnOptions): IPdfTableColumn {
    const result = new PdfTableColumn(
      this,
      this.columns.size(),
      columnName,
      options || new RowColumnOptions());
    this.columns.setValue(columnName, result);
    return result;
  }

  public addDataRow(options?: IRowOptions): IPdfTableRow {
    const result = new PdfTableRow(
      this,
      false,
      this.dataRows.size(),
      options || new RowColumnOptions());
    this.dataRows.setValue(this.dataRows.size(), result);
    return result;
  }

  public addHeaderRow(options?: IRowOptions): IPdfTableRow {
    const result = new PdfTableRow(
      this,
      true,
      this.headerRows.size(),
      options || new RowColumnOptions());
    this.headerRows.setValue(this.headerRows.size(), result);
    return result;
  }

  public column(column: number | string): IPdfTableColumn {
    if (PdfStatics.isNumber(column)) {
      return this.columns.values()[column as number];
    } else {
      return this.columns.getValue(column as string);
    }
  }

  public dataCell(row: number, column: number | string): IPdfTableCell {
    const dataRow = this.dataRow(row);
    return dataRow?.cell(column);
  }

  public dataRow(row: number): IPdfTableRow {
    return this.dataRows.values()[row];
  }

  public headerCell(row: number, column: number | string): IPdfTableCell {
    const headerRow = this.headerRow(row);
    return headerRow?.cell(column);
  }

  public headerRow(row: number): IPdfTableRow {
    return this.headerRows.values[row];
  }

  public getColumnOptions(): IColumnOptions {
    return new RowColumnOptions();
  }

  public getRowOptions(): IRowOptions {
    return new RowColumnOptions();
  }

  public async prepareTable(availableWidth: number, textManager: IPdfTextManager): Promise<void> {

    const columnsWithNoWidth = this.columns.values().filter(col => !col.maxWidth || col.maxWidth < 0);
    console.log('# columnsWithNoWidth', columnsWithNoWidth.length);
    const columnsWithWidth = this.columns.values()
      .filter(col => col.maxWidth && col.maxWidth > 0);
    const sumOfDefinedWidths = columnsWithWidth
      .map(col => col.maxWidth)
      .reduce((sum: number, width: number) => sum + width, 0);
    console.log('sumOfDefinedWidths', sumOfDefinedWidths);
    // if all columns have a maxwidth: calculate the maxwidth using the widths of the columns defined
    if (columnsWithNoWidth.length === 0) {
      if (sumOfDefinedWidths <= availableWidth) {
        this.calculatedWidth = sumOfDefinedWidths;
        this.columns.values().forEach(col => col.calculatedWidth = col.maxWidth);
      } else {
        this.calculatedWidth = availableWidth;
        const factor = availableWidth / sumOfDefinedWidths;
        this.columns.values().forEach(col => col.calculatedWidth = col.maxWidth * factor);
      }
    } else {
      this.calculatedWidth = availableWidth;
      const remainingWidth = availableWidth - sumOfDefinedWidths;
      console.log('calculated width', this.calculatedWidth);
      console.log('remainingWidth width', remainingWidth);
      if (remainingWidth <= 0) {
        console.log('bloody hell, those columns will not fit...');
        columnsWithNoWidth.forEach(col => col.calculatedWidth = 0);
      } else {
        const sumOfProportions = columnsWithNoWidth
          .map(col => col.maxWidth || -1)
          .reduce((sum: number, width: number) => sum + width, 0);
        console.log('sumOfProportions', sumOfProportions);
        const proportion = remainingWidth / sumOfProportions;
        console.log('proportion', proportion);
        // if one or more columns have no maxWidth or maxWidth negative proportionally divide the available space
        columnsWithNoWidth.forEach(col => col.calculatedWidth = (col.maxWidth || -1) * proportion);
        columnsWithWidth.forEach(col => col.calculatedWidth = col.maxWidth);
      }
    }
    let currentOffsetX = 0;
    this.columns.values().forEach(col => {
      col.offsetX = currentOffsetX;
      currentOffsetX += col.calculatedWidth;
    });
    console.log(JSON.stringify(
      this.columns.values().map(col =>
        {
          return {
            number: col.columnNumber,
            name: col.columnName,
            width: col.calculatedWidth,
            offsetX: col.offsetX,
          };
        }),
      null,
      2));
    await Promise.all(this.headerRows.values().map(row => row.prepareRow(textManager)));
    this.calculatedHeaderRowHeight = this.headerRows.values()
      .map(row => row.calculatedHeight)
      .reduce( (prev, current) => prev += current, 0);
    await Promise.all(this.dataRows.values().map(row => row.prepareRow(textManager)));
  }

  public async writeTable(
    x: number,
    y: number,
    lowestY: number,
    currentPage: PDFPage,
    textManager: IPdfTextManager,
    newPageCallBack: () => Promise<PDFPage>): Promise<void> {

    let currentY = y;
    let actualPage = currentPage;
    // #1185 new page if required
    // if there is not enough place for the headers + and at least one dataRows
    // => add a page, similar to the current one (which means: lowestY remains the same)
    if (currentY - this.calculatedHeaderRowHeight - this.dataRows.values()[0].calculatedHeight < lowestY) {
      actualPage = await newPageCallBack();
      currentY = actualPage.getY();
    }
    this.headerRows.values().forEach(row => {
      row.writeRow(x, currentY, actualPage, textManager);
      currentY -= row.calculatedHeight;
    });

    for (let row of this.dataRows.values()) {
      // if there is not enough place for at least one dataRow => next page
      if (currentY - row.calculatedHeight < lowestY) {
        actualPage = await newPageCallBack();
        currentY = actualPage.getY();
        // if we add a page: print the headers again
        this.headerRows.values().forEach(row => {
          row.writeRow(x, currentY, actualPage, textManager);
          currentY -= row.calculatedHeight;
        });
      }
      row.writeRow(x, currentY, actualPage, textManager);

      currentY -= row.calculatedHeight;
    };
    actualPage.moveTo(actualPage.getX(), currentY);
  }
}
