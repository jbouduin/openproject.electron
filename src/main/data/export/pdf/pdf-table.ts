import * as Collections from 'typescript-collections';
import { TableOptions } from "./table-options";
import { IPdfTableColumn, PdfTableColumn } from "./pdf-table-column";
import { IPdfTableRow, PdfTableRow } from "./pdf-table-row";
import { IPdfTableCell } from './pdf-table-cell';
import { PdfStatics } from './pdf-statics';
import { IPdfTextManager } from './pdf-text-manager';
import { PDFPage } from 'pdf-lib';

export interface IPdfTable {
  options: TableOptions;
  columns: Collections.Dictionary<string, IPdfTableColumn>;
  dataRows: Collections.Dictionary<number, IPdfTableRow>;
  headerRows: Collections.Dictionary<number, IPdfTableRow>;
  readonly calculatedWidth: number;
  addColumn(columnName: string, options?: TableOptions): IPdfTableColumn;
  addHeaderRow(options?: TableOptions): IPdfTableRow;
  addDataRow(options?: TableOptions): IPdfTableRow;
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

export class PdfTable implements IPdfTable {

  private calculatedHeaderRowHeight: number;

  public options: TableOptions;
  public columns: Collections.Dictionary<string, IPdfTableColumn>;
  public dataRows: Collections.Dictionary<number, IPdfTableRow>;
  public headerRows: Collections.Dictionary<number, IPdfTableRow>;
  public calculatedWidth: number;

  public constructor(options: TableOptions) {
    this.options = options;
    this.columns = new Collections.Dictionary<string, IPdfTableColumn>();
    this.dataRows = new Collections.Dictionary<number, IPdfTableRow>();
    this.headerRows = new Collections.Dictionary<number, IPdfTableRow>();
  }

  public addColumn(columnName: string, options?: TableOptions): IPdfTableColumn {
    const result = new PdfTableColumn(this, this.columns.size(), columnName, options);
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

  public async prepareTable(availableWidth: number, textManager: IPdfTextManager): Promise<void> {

    const columnsWithNoWidth = this.columns.values().filter(col => !col.maxWidth || col.maxWidth < 0);
    // console.log('# columnsWithNoWidth', columnsWithNoWidth.length);
    const sumOfDefinedWidths = this.columns.values()
      .filter(col => col.maxWidth && col.maxWidth > 0)
      .map(col => col.maxWidth)
      .reduce((sum: number, width: number) => sum + width, 0);
    // console.log('sumOfDefinedWidths', sumOfDefinedWidths);
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
      if (remainingWidth <= 0) {
        console.log('bloody hell, those columns will not fit...');
        columnsWithNoWidth.forEach(col => col.calculatedWidth = 0);
      } else {
        const sumOfProportions = columnsWithNoWidth
          .map(col => col.maxWidth || -1)
          .reduce((sum: number, width: number) => sum + width, 0);
        // console.log('sumOfProportions', sumOfProportions);
        const proportion = remainingWidth / sumOfProportions;
        // if one or more columns have no maxWidth or maxWidth negative proportionally divide the available space
        columnsWithNoWidth.forEach(col => col.calculatedWidth = (col.maxWidth || -1) * proportion);
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
