import { injectable, inject } from "inversify";
import moment from 'moment';
import { Content, ContextPageSize, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";

import { ILogService, IOpenprojectService } from "@core";
import { IRoutedDataService } from "@data/routed-data-service";
import { IDataRouterService, RoutedRequest } from "@data";
import { DtoUntypedDataResponse, DtoWorkPackage, LogSource } from "@ipc";
import { DtoTimeEntry, DtoTimeEntryExportRequest } from "@ipc";
import { TimeEntryLayoutLines, TimeEntryLayoutSubtotal } from "@ipc";
import { TimeEntrySort } from "@common";
import { PdfStatics } from "./pdf-statics";

import SERVICETYPES from "@core/service.types";
import { BaseExportService } from "./base-export.service";
import { Subtotal } from "./sub-total";

export interface ITimesheetExportService extends IRoutedDataService { }

@injectable()
export class TimesheetExportService extends BaseExportService implements ITimesheetExportService {

  //#region abstract BaseExportService methods implementation -----------------
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

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService) {
    super(logService, openprojectService);
  }
  //#endregion

  //#region IDataService interface members ------------------------------------
  public setRoutes(router: IDataRouterService): void {
    router.post('/export/time-entries', this.exportTimeSheets.bind(this));
  }
  //#endregion

  //#region Callback methods --------------------------------------------------
  private async exportTimeSheets(routedRequest: RoutedRequest): Promise<DtoUntypedDataResponse> {
    return this.executeExport(
      routedRequest.data,
      this.buildPdf.bind(this)
    );
  }
  //#endregion

  //#region executeExport callback method -------------------------------------
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
  //#endregion

  //#region private methods ---------------------------------------------------
  private buildEntryTable(exportRequest: DtoTimeEntryExportRequest): Content {
    const rows = new Array<Array<TableCell>>();
    // add the table header row
    rows.push(
      this.buildTableRow(
        'Datum',
        'Aufgabe',
        exportRequest.layoutLines === TimeEntryLayoutLines.perEntry ? 'Von' : undefined,
        exportRequest.layoutLines === TimeEntryLayoutLines.perEntry ? 'Bis' : undefined,
        'Zeit', true));

    if (exportRequest.layoutLines === TimeEntryLayoutLines.perEntry) {
      rows.push(...this.buildFullDetailTable(exportRequest.data, exportRequest.subtotal));
    } else {
      rows.push(...this.buildCondensedDetailTable(exportRequest.data, exportRequest.subtotal))
    }

    // TODO use build table from rows
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

  private buildFullDetailTable(entries: Array<DtoTimeEntry>, subtotal: TimeEntryLayoutSubtotal): Array<Array<TableCell>> {
    const result = new Array<Array<TableCell>>();

    return result;
  }

  private buildCondensedDetailTable(entries: Array<DtoTimeEntry>, subtotal: TimeEntryLayoutSubtotal): Array<Array<TableCell>> {
    const result = new Array<Array<TableCell>>();
    const detailLines = new Array<Subtotal<[DtoWorkPackage, Date]>>();
    const subTotals = new Array<Subtotal<DtoWorkPackage | Date>>();
    const grandTotal = this.calculateSubTotalsForDateAndWorkPackage(entries, detailLines, subTotals, subtotal);
    this.sortSubTotalsForDateOrWorkPackage(subTotals, subtotal);

    if (subtotal !== TimeEntryLayoutSubtotal.none) {
      subTotals.forEach((sub: Subtotal<DtoWorkPackage | Date>) => {
        const filtered = detailLines
          .filter((line: Subtotal<[DtoWorkPackage, Date]>) => {
            if (subtotal === TimeEntryLayoutSubtotal.date) {
              return line.subTotalFor[1].getTime() === (sub.subTotalFor as Date).getTime();
            } else {
              return line.subTotalFor[0].id === (sub.subTotalFor as DtoWorkPackage).id;
            }
          });
        filtered.sort((a: Subtotal<[DtoWorkPackage, Date]>, b: Subtotal<[DtoWorkPackage, Date]>) => {
          if (subtotal === TimeEntryLayoutSubtotal.date) {
            return a.subTotalFor[1].getTime() - b.subTotalFor[1].getTime();
          } else {
            return a.subTotalFor[0].subject.localeCompare(b.subTotalFor[0].subject);
          }
        });
        result.push(...filtered.map((line: Subtotal<[DtoWorkPackage, Date]>) =>
          this.buildTableRow(
            moment(line.subTotalFor[1]).format('DD.MM.YYYY'),
            line.subTotalFor[0].subject,
            undefined,
            undefined,
            line.totalAsString,
            false
          )
        )
        );
        const subTotalText = subtotal === TimeEntryLayoutSubtotal.date ?
          moment(sub.subTotalFor as Date).format('DD.MM.YYYY') :
          (sub.subTotalFor as DtoWorkPackage).subject;
        result.push(this.buildTotalRow(
          TimeEntryLayoutLines.perWorkPackageAndDate,
          `Zwischensumme für ${subTotalText}`,
          sub.totalAsString
        ));
      });
    } else {
      detailLines.sort((a: Subtotal<[DtoWorkPackage, Date]>, b: Subtotal<[DtoWorkPackage, Date]>) => {
        let result = a.subTotalFor[1].getTime() - b.subTotalFor[1].getTime();
        if (result !== 0) {
          result = a.subTotalFor[0].subject.localeCompare(b.subTotalFor[0].subject);
        }
        return result;
      });
      result.push(...detailLines
        .map((line: Subtotal<[DtoWorkPackage, Date]>) =>
          this.buildTableRow(
            moment(line.subTotalFor[1]).format('DD.MM.YYYY'),
            line.subTotalFor[0].subject,
            undefined,
            undefined,
            line.totalAsString,
            false
          )
        )
      );
    }

    result.push(this.buildTotalRow(
      TimeEntryLayoutLines.perWorkPackageAndDate,
      `Summe`,
      grandTotal.totalAsString
    ));
    return result;
  }

  private calculateSubTotalsForDateAndWorkPackage(
    entries: Array<DtoTimeEntry>,
    detailLines: Array<Subtotal<[DtoWorkPackage, Date]>>,
    subtotals: Array<Subtotal<DtoWorkPackage | Date>>,
    subtotal: TimeEntryLayoutSubtotal): Subtotal<number> {
    const result = new Subtotal(0, '0', false);
    entries.forEach((entry: DtoTimeEntry) => {
      // TODO: check why this is a string again
      if (typeof entry.spentOn === 'string') {
        entry.spentOn = new Date(entry.spentOn);
      }
      result.addTime(entry.hours, false);
      const line = detailLines
        .find((detailLine: Subtotal<[DtoWorkPackage, Date]>) => {
          return detailLine.subTotalFor[0].id === entry.workPackage.id && detailLine.subTotalFor[1].getTime() === entry.spentOn.getTime()
        }
        );
      if (line) {
        line.addTime(entry.hours, false);
      } else {
        detailLines.push(new Subtotal<[DtoWorkPackage, Date]>([entry.workPackage, entry.spentOn], entry.hours, false));
      }
      if (subtotal !== TimeEntryLayoutSubtotal.none) {
        const toUpdate = subtotals
          .find((sub: Subtotal<DtoWorkPackage | Date>) => {
            if (subtotal === TimeEntryLayoutSubtotal.date) {
              return (sub.subTotalFor as Date).getTime() === entry.spentOn.getTime();
            } else {
              return (sub.subTotalFor as DtoWorkPackage).id === entry.workPackage.id;
            }
          })
        if (toUpdate) {
          toUpdate.addTime(entry.hours, false);
        } else {
          subtotals.push(new Subtotal<DtoWorkPackage | Date>(
            subtotal === TimeEntryLayoutSubtotal.workpackage ? entry.workPackage : entry.spentOn,
            entry.hours,
            false
          ));
        }
      }
    });
    return result;
  }

  private sortSubTotalsForDateOrWorkPackage(subtotals: Array<Subtotal<DtoWorkPackage | Date>>, subtotal: TimeEntryLayoutSubtotal): void {
    subtotals.sort((a: Subtotal<DtoWorkPackage | Date>, b: Subtotal<DtoWorkPackage | Date>) => {
      if (subtotal === TimeEntryLayoutSubtotal.date) {
        return (a.subTotalFor as Date).getTime() - (b.subTotalFor as Date).getTime();
      } else {
        return (a.subTotalFor as DtoWorkPackage).subject.localeCompare((b.subTotalFor as DtoWorkPackage).subject);
      }
    })
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

  private buildTotalRow(layoutLines: TimeEntryLayoutLines, text: string, value: string): Array<TableCell> {
    const result = new Array<TableCell>();
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
      text: value,
      alignment: 'center',
      bold: true
    });
    return result;
  }
  //#endregion
}