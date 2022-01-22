import { app, shell } from "electron";
import * as fs from 'fs';
import { injectable } from "inversify";
import moment from "moment";
import path from "path";
import PdfPrinter from "pdfmake";
import { Content, ContextPageSize, Size, TableCell, TDocumentDefinitions, TFontDictionary } from "pdfmake/interfaces";

import { ILogService, IOpenprojectService } from "@core";
import { BaseDataService } from "@data/base-data-service";
import { DataStatus, DtoBaseExportRequest, DtoTimeEntryActivity, DtoUntypedDataResponse, LogSource } from "@ipc";
import { PdfStatics } from "./pdf-statics";
import { isUndefined, noop, subtract } from "lodash";
import { Subtotal } from "./sub-total";

export type ExecuteExportCallBack = (request: DtoBaseExportRequest, docDefinition: TDocumentDefinitions, ...args: Array<any>) => void;

@injectable()
export abstract class BaseExportService extends BaseDataService {

  //#region Protected properties ----------------------------------------------
  protected footerImage: string;
  protected headerImage: string;
  protected authorName: string;
  //#endregion

  //#region BaseDataService abstract properties implementation ----------------
  protected get entityRoot(): string {
    return '/export';
  }
  //#endregion

  //#region abstract methods --------------------------------------------------
  protected abstract buildPageFooter(currentPage: number, pageCount: number, pageSize: ContextPageSize): Content;
  protected abstract buildPageHeader(_currentPage: number, _pageCount: number, pageSize: ContextPageSize): Content;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    logService: ILogService,
    openprojectService: IOpenprojectService) {
    super(logService, openprojectService);
    this.authorName = 'Johan Bouduin';
  }
  //#endregion

  //#region the main execute method -------------------------------------------
  /**
   *
   * @param data the export request
   * @param callBack the callback method that will create the contents
   * @param args data to be used for exporting
   * @returns
   */
  protected async executeExport(data: DtoBaseExportRequest, callBack: ExecuteExportCallBack, ...args: Array<any>): Promise<DtoUntypedDataResponse> {
    let response: DtoUntypedDataResponse;
    try {
      this.footerImage = path.resolve(app.getAppPath(), 'dist/main/static/images/footer.png');
      this.headerImage = path.resolve(app.getAppPath(), 'dist/main/static/images/header.png');

      const portraitDefinition = fs.readFileSync(path.resolve(app.getAppPath(), 'dist/main/static/pdf/portrait.json'), 'utf-8');
      const docDefinition = JSON.parse(portraitDefinition) as TDocumentDefinitions;

      callBack(data, docDefinition, ...args);

      docDefinition.pageMargins = [
        15 / PdfStatics.pdfPointInMillimeters, // left
        36 / PdfStatics.pdfPointInMillimeters, // top
        15 / PdfStatics.pdfPointInMillimeters, // right
        33.5 / PdfStatics.pdfPointInMillimeters // bottom
      ];
      docDefinition.defaultStyle = {
        font: 'Times'
      };
      docDefinition.footer = this.buildPageFooter.bind(this);
      docDefinition.header = this.buildPageHeader.bind(this);

      if (data.pdfCommonSelection.dumpJson) {
        fs.writeFile(
          `${data.pdfCommonSelection.fileName}.json`,
          JSON.stringify(docDefinition, null, 2),
          noop
        );
      }

      const printer = new PdfPrinter(this.buildFontDictionary());
      const pdfDoc = printer.createPdfKitDocument(docDefinition);

      const stream = fs.createWriteStream(data.pdfCommonSelection.fileName);
      pdfDoc.pipe(stream);
      pdfDoc.end();
      if (data.pdfCommonSelection.openFile) {
        shell.openPath(data.pdfCommonSelection.fileName);
      }
      response = {
        status: DataStatus.Accepted
      };
    } catch (error) {
      this.logService.error(LogSource.Main, error);
      response = this.processServiceError(error);
    }
    return response;
  }
  //#endregion

  //#region base class helper methods -----------------------------------------
  /**
   * converst a duration in ISO8601 format to a string representation
   * @param duration  the duration as IS0-8601 string
   * @returns the duration as HH:MM (HH can be any number!). If the duration is zero, an empty string is returned
   */
  protected IsoDurationAsString(duration: string): string {
    const asMoment = moment.duration(duration);
    return this.millisecondsAsString(asMoment.asMilliseconds());
  }

  /**
   * build a single table row spanning the number of columns specified
   * @param text the text to be displayed
   * @param columns the number of columns to span
   * @param centered
   * @param fontSize
   * @returns a single row (Array<TableCell>)
   */
  protected buildTableHeaderLine(text: string, columns: number, centered: boolean, bold?: boolean, fontSize?: number): Array<TableCell> {
    const result = new Array<TableCell>();
    result.push({
      text: text,
      fontSize: fontSize,
      bold: bold,
      alignment: centered ? 'center' : 'left',
      colSpan: columns
    });

    for (let i = 1; i < columns; i++) {
      result.push({});
    }
    return result;
  }

  /**
   * build a single table row to display (sub)totals. The  property subtotalFor is used as label. Durations equal to 0 are not displayed
   * @param billable: if set to true, three duration columns (billable, non-billable and total) are shown. Otherwise only the total duration is shown
   * @param subtotal the contents of the subtotal line.
   * @param labelColumnSpan the number of columns the label spans
   * @param bold
   * @param fontSize
   * @returns a single row (Array<TableCell>)
   */
  protected buildSubTotalLine(billable: boolean, subtotal: Subtotal<string>, labelColumnSpan: number, bold: boolean, fontSize?: number): Array<TableCell> {
    const result = new Array<TableCell>();
    result.push({
      text: subtotal.subTotalFor,
      alignment: 'right',
      bold: bold,
      fontSize: fontSize,
      colSpan: labelColumnSpan
    });

    for (let i = 1; i < labelColumnSpan; i++) {
      result.push({});
    }

    if (billable) {
      result.push({
        text: subtotal.nonBillableAsString,
        alignment: 'center',
        fontSize: fontSize,
        bold: bold
      });
      result.push({
        text: subtotal.billableAsString,
        alignment: 'center',
        fontSize: fontSize,
        bold: bold
      });
    }

    result.push({
      text: subtotal.totalAsString,
      alignment: 'center',
      fontSize: fontSize,
      bold: bold
    });

    return result;
  }

  /**
   * build a single table row to display (sub)totals.
   * @param label the text to be displayed in front of the values
   * @param labelColumnSpan the number of columns the labels spans
   * @param bold
   * @param total the sum of billable and non billable
   * @param nonBillable the non billable number of hours
   * @param billable the billabel number of hours
   * @returns a single row (Array<TableCell>)
   * @deprecated replace by buildSubTotalLine
   */
  protected buildSubTotalLineOld(label: string, labelColumnSpan: number, bold: boolean, total: string, nonBillable: string | undefined, billable: string | undefined): Array<TableCell> {
    const result = new Array<TableCell>();
    result.push({
      text: label,
      alignment: 'right',
      bold: bold,
      colSpan: labelColumnSpan
    });

    for (let i = 1; i < labelColumnSpan; i++) {
      result.push({});
    }

    if (!isUndefined(nonBillable)) {
      result.push({
        text: nonBillable,
        alignment: 'center',
        bold: bold
      });
    }

    if (!isUndefined(billable)) {
      result.push({
        text: billable,
        alignment: 'center',
        bold: bold
      });
    }

    result.push({
      text: total,
      alignment: 'center',
      bold: bold
    });

    return result;
  }

  protected exportActivities(billable: boolean, actSubTotals: Array<Subtotal<DtoTimeEntryActivity>>, grandTotal: Subtotal<number>): Content {
    const rows = new Array<Array<TableCell>>();
    // created header lines
    rows.push(this.buildTableHeaderLine(
      'Zusammenfassung Aktivitäten',
      billable ? 5 : 3,
      true,
      true,
      16)
    );

    const firstRow = new Array<TableCell>();
    firstRow.push({
      text: 'Aktivität',
      bold: true,
      colSpan: 2
    });
    firstRow.push({});
    const secondRow = new Array<TableCell>();
    secondRow.push({
      text: 'ID',
      bold: true
    });
    secondRow.push({
      text: 'Beschreibung',
      bold: true
    });
    rows.push(
      ...this.appendDurationColumnsToDoubleHeaderLine(
        billable,
        [
          firstRow,
          secondRow
        ],
        true
      )
    );

    // create details
    rows.push(
      ...actSubTotals.map((subTotal: Subtotal<DtoTimeEntryActivity>) => {
        const row = new Array<TableCell>();
        row.push({
          text: `# ${subTotal.subTotalFor.id}`
        });
        row.push({
          text: subTotal.subTotalFor.name
        });
        if (billable) {
          row.push({
            text: subTotal.nonBillableAsString,
            alignment: 'center',
          });
          row.push({
            text: subTotal.billableAsString,
            alignment: 'center',
          });
        }
        row.push(
          {
            text: subTotal.totalAsString,
            alignment: 'center',
          });
        return row;
      })
    );

    // add grand total
    rows.push(
      this.buildSubTotalLine(
        billable,
        grandTotal.toExportable(`Summe`),
        2,
        true)
    );
    return this.buildTableFromRows(
      rows,
      billable ? [
        15 / PdfStatics.pdfPointInMillimeters,
        '*',
        15 / PdfStatics.pdfPointInMillimeters,
        15 / PdfStatics.pdfPointInMillimeters,
        15 / PdfStatics.pdfPointInMillimeters
      ] : [
        15 / PdfStatics.pdfPointInMillimeters,
        '*',
        15 / PdfStatics.pdfPointInMillimeters
      ],
      2,
      1);
  }

  /**
   * returns a table
   * @param rows the rows of the table
   * @param widths
   * @param headerRows
   * @param keepWithHeaderRows
   * @returns the table (Content)
   */
  protected buildTableFromRows(
    rows: Array<Array<TableCell>>,
    widths?: '*' | 'auto' | Size[] | undefined,
    headerRows?: number,
    keepWithHeaderRows?: number): Content {
    const result: Content = {
      margin: [0, 5 / PdfStatics.pdfPointInMillimeters],
      table: {
        headerRows: headerRows,
        keepWithHeaderRows: keepWithHeaderRows,
        dontBreakRows: true,
        widths: widths,
        body: rows
      }
    };
    // [
    //   10 / PdfStatics.pdfPointInMillimeters,
    //   25 / PdfStatics.pdfPointInMillimeters,
    //   '*',
    //   15 / PdfStatics.pdfPointInMillimeters,
    //   15 / PdfStatics.pdfPointInMillimeters,
    //   15 / PdfStatics.pdfPointInMillimeters
    // ],
    return result;
  }

  /**
   * Append the duration columns to an incomplete headerline. If billable is set to true, a second line is appended.
   * @param billable if set to true, three duration columns (billable, non-billable and total) are shown. Otherwise only the total duration is shown
   * @param incompleteHeaderLine
   * @param bold
   * @param fontSize
   * @returns if billable: two table lines, otherwise one single table line
   */
  protected appendDurationColumnsToSingleHeaderLine(
    billable: boolean,
    incompleteHeaderLine: Array<TableCell>,
    bold: boolean,
    fontSize?: number): Array<Array<TableCell>> {
    const result = new Array<Array<TableCell>>();
    // if billable: we need two lines
    if (billable) {
      const emptyLine = new Array<TableCell>();
      incompleteHeaderLine.forEach((cell: TableCell) => {
        emptyLine.push({})
        if (billable) {
          // cell.rowSpan = 2; => gives an error Property 'rowSpan' does not exist on type 'TableCell'. Property 'rowSpan' does not exist on type '{}'.ts(2339)
          cell['rowSpan'] = 2; // to make sure that these cells span two rows.
        }
      });
      result.push(
        ...this.appendDurationColumnsToDoubleHeaderLine(billable, [incompleteHeaderLine, emptyLine], bold, fontSize)
      );
    } else {
      incompleteHeaderLine.push({
        text: 'Std.',
        alignment: 'center',
        bold: bold,
        fontSize: fontSize
      });
      result.push(incompleteHeaderLine);
    }

    return result;
  }

  /**
   * Append the duration columns to a set of incomplete headerline. Both lines must have the same number of columns.
   * @param billable if set to true, three duration columns (billable, non-billable and total) are shown. Otherwise only the total duration is shown
   * @param incompleteHeaderLines
   * @param bold
   * @param fontSize
   * @returns the two headerlines with the required duration columns attached
   */
  protected appendDurationColumnsToDoubleHeaderLine(
    billable: boolean,
    incompleteHeaderLines: [Array<TableCell>, Array<TableCell>],
    bold: boolean,
    fontSize?: number): Array<Array<TableCell>> {
    const firstLine = incompleteHeaderLines[0];
    const secondLine = incompleteHeaderLines[1];
    if (firstLine.length !== secondLine.length) {
      throw RangeError('Different length for both header lines');
    }

    if (billable) {
      firstLine.push({
        text: 'Abrechenbar',
        bold: bold,
        fontSize: fontSize,
        colSpan: 2,
        alignment: 'center'
      });
      firstLine.push({});
      firstLine.push({
        text: 'Total',
        bold: bold,
        fontSize: fontSize,
        alignment: 'center',
        rowSpan: 2
      });
      secondLine.push({
        text: 'Nein',
        bold: bold,
        fontSize: fontSize,
        alignment: 'center'
      });
      secondLine.push({
        text: 'Ja',
        bold: bold,
        fontSize: fontSize,
        alignment: 'center'
      });
    } else {
      firstLine.push({
        text: 'Std.',
        alignment: 'center',
        bold: bold,
        rowSpan: 2,
        fontSize: fontSize
      });
    }
    secondLine.push({});
    return [firstLine, secondLine];
  }

  //#endregion

  //#region private methods ---------------------------------------------------
  private buildFontDictionary(): TFontDictionary {
    const result: TFontDictionary = {
      Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
      }
    };
    return result;
  }
  //#endregion

  // TODO #1578 after refactoring timesheet, this method should become private
  protected millisecondsAsString(milliseconds: number): string {
    let result = '';
    if (milliseconds > 0) {
      let value = milliseconds / 1000;
      const hours = Math.floor(value / 3600);
      value = value % 3600;
      const minutes = Math.floor(value / 60);
      result = hours.toString().padStart(2, '0') + ':' +
        minutes.toString().padStart(2, '0');
    }
    return result;
  }

}