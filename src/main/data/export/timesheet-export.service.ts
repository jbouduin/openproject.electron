import { injectable, inject } from "inversify";
import moment from 'moment';
import { Content, ContextPageSize, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";

import { ILogService, IOpenprojectService } from "@core";
import { IDataService } from "@data/data-service";
import { IDataRouterService, RoutedRequest } from "@data";
import { DtoUntypedDataResponse, LogSource } from "@ipc";
import { DtoTimeEntry, DtoTimeEntryExportRequest } from "@ipc";
import { TimeEntryLayoutLines, TimeEntryLayoutSubtotal } from "@ipc";
import { TimeEntrySort } from "@common";
import { PdfStatics } from "./pdf-statics";

import SERVICETYPES from "@core/service.types";
import { BaseExportService } from "./base-export.service";

export interface ITimesheetExportService extends IDataService { }

@injectable()
export class TimesheetExportService extends BaseExportService implements ITimesheetExportService {

  //#region abstract BaseExportService methods implementation
  protected buildPageFooter(currentPage: number, pageCount: number, pageSize: ContextPageSize): Content {
    return [
      {
        columns: [
          {
            text: `Stundennachweis ${this.authorName}`,
            alignment: 'left',
            fontSize: 11
          },
          {
            text: `Seite ${currentPage} / ${pageCount}`,
            alignment: 'right',
            fontSize: 11
          }
        ],
        margin: [
          15 / PdfStatics.pdfPointInMillimeters,
          11 / PdfStatics.pdfPointInMillimeters,
          15 / PdfStatics.pdfPointInMillimeters,
          1 / PdfStatics.pdfPointInMillimeters
        ]
      },
      {
        image: this.footerImage,
        width: pageSize.width - (30 / PdfStatics.pdfPointInMillimeters),
        margin: [
          15 / PdfStatics.pdfPointInMillimeters,
          0.25 / PdfStatics.pdfPointInMillimeters
        ]
      }
    ];
  }

  protected buildPageHeader(_currentPage: number, _pageCount: number, pageSize: ContextPageSize): Content {
    return [
      {
        image: this.headerImage,
        width: pageSize.width - (30 / PdfStatics.pdfPointInMillimeters),
        absolutePosition: {
          "x": 15 / PdfStatics.pdfPointInMillimeters,
          "y": 10 / PdfStatics.pdfPointInMillimeters
        }
      }
    ];
  }
  //#endregion

  //#region Constructor & C°
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService) {
    super(logService, openprojectService);
  }
  //#endregion

  //#region IDataService interface members
  public setRoutes(router: IDataRouterService): void {
    router.post('/export/time-entries', this.exportTimeSheets.bind(this));
  }
  //#endregion

  //#region Callback methods
  private async exportTimeSheets(routedRequest: RoutedRequest): Promise<DtoUntypedDataResponse> {
    return this.executeExport(
      routedRequest.data,
      this.buildPdf.bind(this)
    );
  }
  //#endregion

  //#region private methods
  private buildEntryTable(exportRequest: DtoTimeEntryExportRequest): Content {
    const rows = new Array<Array<TableCell>>();

    let grandTotal = 0;
    let subtotalByWp = 0;
    let subtotalByDate = 0;
    let prevWp: string;
    let prevDate: Date;

    let entries = this.sortEntries(exportRequest.data, exportRequest.subtotal);
    if (exportRequest.layoutLines === TimeEntryLayoutLines.perWorkPackageAndDate) {
      entries = this.reduceEntries(entries);
    }
    // add the table header row
    rows.push(
      this.buildTableRow(
        'Datum',
        'Aufgabe',
        exportRequest.layoutLines === TimeEntryLayoutLines.perEntry ? 'Von' : undefined,
        exportRequest.layoutLines === TimeEntryLayoutLines.perEntry ? 'Bis' : undefined,
        'Zeit', true));
    // fill the table
    entries.forEach((entry: DtoTimeEntry, index: number) => {
      // add a subtotal line if required
      if (index > 0 && exportRequest.subtotal != TimeEntryLayoutSubtotal.none &&
        (prevWp !== entry.workPackage.subject || prevDate !== entry.spentOn)) {
        switch (exportRequest.subtotal) {
          case TimeEntryLayoutSubtotal.workpackage: {
            if (prevWp !== entry.workPackage.subject) {
              rows.push(this.buildTotalRow(
                exportRequest.layoutLines,
                `Zwischensumme für ${prevWp}`,
                subtotalByWp
              ));
              subtotalByWp = 0;
            }
            break;
          }
          case TimeEntryLayoutSubtotal.workpackageAndDate: {
            if (prevWp !== entry.workPackage.subject) {
              rows.push(this.buildTotalRow(
                exportRequest.layoutLines,
                `Zwischensumme für ${prevWp}`,
                subtotalByWp
              ));
              subtotalByWp = 0;
            }
            if (prevDate !== entry.spentOn) {
              rows.push(this.buildTotalRow(
                exportRequest.layoutLines,
                `Zwischensumme für ${moment(prevDate).format('DD.MM.YYYY')}`,
                subtotalByDate
              ));
              subtotalByDate = 0;
              subtotalByWp = 0;
            }
            break;
          }
          case TimeEntryLayoutSubtotal.date: {
            if (prevDate !== entry.spentOn) {
              rows.push(this.buildTotalRow(
                exportRequest.layoutLines,
                `Zwischensumme für ${moment(prevDate).format('DD.MM.YYYY')}`,
                subtotalByDate
              ));
              subtotalByDate = 0;
            }
            break;
          }
          case TimeEntryLayoutSubtotal.dateAndWorkpackage: {
            if (prevDate !== entry.spentOn) {
              rows.push(this.buildTotalRow(
                exportRequest.layoutLines,
                `Zwischensumme für ${moment(prevDate).format('DD.MM.YYYY')}`,
                subtotalByDate
              ));
              subtotalByDate = 0;
            }
            if (prevWp !== entry.workPackage.subject) {
              rows.push(this.buildTotalRow(
                exportRequest.layoutLines,
                `Zwischensumme für ${prevWp}`,
                subtotalByWp
              ));
              subtotalByWp = 0;
              subtotalByDate = 0;
            }
            break;
          }
        }
      }

      try {
        const durationInMilliseconds = moment.duration(entry.hours).asMilliseconds();
        rows.push(this.buildTableRow(
          moment(entry.spentOn).format('DD.MM.YYYY'),
          entry.workPackage.subject,
          exportRequest.layoutLines === TimeEntryLayoutLines.perEntry ? entry.start : undefined,
          exportRequest.layoutLines === TimeEntryLayoutLines.perEntry ? entry.end : undefined,
          this.millisecondsAsString(durationInMilliseconds),
          false
        ));

        grandTotal += durationInMilliseconds;
        subtotalByWp += durationInMilliseconds;
        subtotalByDate += durationInMilliseconds;
        prevWp = entry.workPackage.subject;
        prevDate = entry.spentOn;
      } catch (error) {
        this.logService.error(LogSource.Main, 'error converting', entry, error);
      }
    }); // end entries.forEach

    // add the last subtotals if required
    switch (exportRequest.subtotal) {
      case TimeEntryLayoutSubtotal.workpackage: {
        rows.push(this.buildTotalRow(
          exportRequest.layoutLines,
          `Zwischensumme für ${prevWp}`,
          subtotalByWp
        ));
        break;
      }
      case TimeEntryLayoutSubtotal.workpackageAndDate: {
        rows.push(this.buildTotalRow(
          exportRequest.layoutLines,
          `Zwischensumme für ${prevWp}`,
          subtotalByWp
        ));
        rows.push(this.buildTotalRow(
          exportRequest.layoutLines,
          `Zwischensumme für ${moment(prevDate).format('DD.MM.YYYY')}`,
          subtotalByDate
        ));
        break;
      }
      case TimeEntryLayoutSubtotal.date: {
        rows.push(this.buildTotalRow(
          exportRequest.layoutLines,
          `Zwischensumme für ${moment(prevDate).format('DD.MM.YYYY')}`,
          subtotalByDate
        ));
        break;
      }
      case TimeEntryLayoutSubtotal.dateAndWorkpackage: {
        rows.push(this.buildTotalRow(
          exportRequest.layoutLines,
          `Zwischensumme für ${moment(prevDate).format('DD.MM.YYYY')}`,
          subtotalByDate
        ));
        rows.push(this.buildTotalRow(
          exportRequest.layoutLines,
          `Zwischensumme für ${prevWp}`,
          subtotalByWp
        ));
        break;
      }
    }
    // add the grand total
    rows.push(this.buildTotalRow(
      exportRequest.layoutLines,
      'Summe',
      grandTotal
    ));

    const result: Content = {
      table: {
        headerRows: 1,
        keepWithHeaderRows: 3,
        widths: exportRequest.layoutLines === TimeEntryLayoutLines.perEntry ?
          [
            25 / PdfStatics.pdfPointInMillimeters,
            '*',
            15 / PdfStatics.pdfPointInMillimeters,
            15 / PdfStatics.pdfPointInMillimeters,
            15 / PdfStatics.pdfPointInMillimeters
          ] :
          [
            25 / PdfStatics.pdfPointInMillimeters,
            '*',
            20 / PdfStatics.pdfPointInMillimeters
          ],
        body: rows,
      }
    };

    return result;
  }

  private buildPdf(exportRequest: DtoTimeEntryExportRequest, docDefinition: TDocumentDefinitions): void {
    docDefinition.info = {
      title: exportRequest.title.filter(line => line ? true : false).join(' ') || 'Timesheets',
      author: this.authorName,
      subject: 'Timesheet'
    };

    docDefinition.content = [
      {
        text: exportRequest.title.filter(line => line ? true : false).join('\r\n'),
        fontSize: 24,
        bold: true,
        decoration: 'underline',
        alignment: 'center',
        margin: [0, 25 / PdfStatics.pdfPointInMillimeters]
      }
    ];

    docDefinition.content.push(this.buildEntryTable(exportRequest));
    docDefinition.content.push(this.buildSignatureTable(exportRequest));
  }

  private buildSignatureTable(exportRequest: DtoTimeEntryExportRequest): Content {
    const underline = [false, false, false, true];
    const noBorder = [false, false, false, false];
    const result: Content = {
      table: {
        dontBreakRows: true,
        layout: 'noBorders',
        headerRows: 1,
        keepWithHeaderRows: 2,
        widths: [
          '*',
          10 / PdfStatics.pdfPointInMillimeters,
          '*',
        ],
        body: [
          [
            {
              text: ' ',
              lineHeight: 7,
              border: noBorder
            },
            {
              text: ' ',
              lineHeight: 7,
              border: noBorder
            },
            {
              text: ' ',
              lineHeight: 7,
              border: noBorder
            }
          ],
          [
            {
              text: `${this.authorName}, Aßling, ${moment().format('DD.MM.YYYY')}`,
              fontSize: 11,
              border: underline
            },
            {
              text: '',
              border: noBorder
            },
            {
              text: `${[exportRequest.approvalName, exportRequest.approvalLocation].filter(f => f !== null).join(', ')}`,
              fontSize: 11,
              border: underline
            },
          ],
          [
            {
              text: 'Name, Ort, Datum',
              fontSize: 8,
              border: noBorder
            },
            {
              text: '',
              border: noBorder
            },
            {
              text: 'Name, Ort, Datum',
              fontSize: 8,
              border: noBorder
            },
          ],
        ]
      }
    }
    return result;
  }

  private buildTableRow(date: string, task: string, from: string | undefined, to: string | undefined, time: string, bold: boolean): Array<TableCell> {
    const result = new Array<TableCell>();
    result.push({ text: date, alignment: 'center', bold: bold });
    result.push({ text: task, alignment: 'left', bold: bold });
    if (from) {
      result.push({ text: from, alignment: 'center', bold: bold });
    }
    if (to) {
      result.push({ text: to, alignment: 'center', bold: bold });
    }
    result.push({ text: time, alignment: 'center', bold: bold });
    return result;
  }

  private buildTotalRow(layoutLines: TimeEntryLayoutLines, text: string, value: number): Array<TableCell> {
    const result = new Array<TableCell>();
    value /= 1000;
    const hours = Math.floor(value / 3600);
    value = value % 3600;
    const minutes = Math.floor(value / 60);

    result.push({
      text: text,
      alignment: 'right',
      colSpan: layoutLines === TimeEntryLayoutLines.perEntry ? 4 : 2,
      bold: true
    });
    if (layoutLines === TimeEntryLayoutLines.perEntry) {
      result.push({});
      result.push({});
    }
    result.push({});
    result.push({
      text: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      alignment: 'center',
      bold: true
    });
    return result;
  }

  private reduceEntries(entries: Array<DtoTimeEntry>): Array<DtoTimeEntry> {
    const result = new Array<DtoTimeEntry>();
    if (entries.length === 0) {
      return result;
    }
    result.push(entries[0]);
    // TODO #1578 we do not need reduce here, do we?
    entries.reduce((_previous: DtoTimeEntry, current: DtoTimeEntry) => {

      const accumulated = result.find(entry => entry.spentOn === current.spentOn &&
        entry.workPackage.id === current.workPackage.id);
      if (!accumulated) {

        result.push(current);
      } else {

        accumulated.hours = moment.duration(accumulated.hours)
          .add(moment.duration(current.hours))
          .toISOString();
      }

      return current;
    });
    return result;
  }

  private sortEntries(entries: Array<DtoTimeEntry>, subtotal: TimeEntryLayoutSubtotal): Array<DtoTimeEntry> {
    switch (subtotal) {
      case TimeEntryLayoutSubtotal.workpackage:
      case TimeEntryLayoutSubtotal.workpackageAndDate: {
        return TimeEntrySort.sortByProjectAndWorkPackageAndDate(entries);
      }
      case TimeEntryLayoutSubtotal.date:
      case TimeEntryLayoutSubtotal.dateAndWorkpackage: {
        return TimeEntrySort.sortByDateAndProjectAndWorkPackage(entries);
      }
      default: {
        return TimeEntrySort.sortByDateAndTime(entries);
      }
    }
  }
  //#endregion
}