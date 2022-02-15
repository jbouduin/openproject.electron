import { injectable, inject } from "inversify";
import moment from 'moment';
import { Content, ContextPageSize, TableCell, TDocumentDefinitions } from "pdfmake/interfaces";

import { ILogService, IOpenprojectService } from "@core";
import { IRoutedDataService } from "@data/routed-data-service";
import { IDataRouterService, ITimeEntrySortService, RoutedRequest } from "@data";
import { DtoUntypedDataResponse, DtoWorkPackage } from "@ipc";
import { DtoTimeEntry, DtoTimeEntryExportRequest } from "@ipc";
import { TimeEntryLayoutLines, TimeEntryLayoutSubtotal } from "@ipc";
import { PdfStatics } from "./pdf-statics";

import SERVICETYPES from "@core/service.types";
import { BaseExportService } from "./base-export.service";
import { Subtotal } from "./sub-total";

export type ITimesheetExportService = IRoutedDataService;

@injectable()
export class TimesheetExportService extends BaseExportService implements ITimesheetExportService {

  //#region private fields- ---------------------------------------------------
  private timeEntrySortService: ITimeEntrySortService;
  //#endregion

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
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(SERVICETYPES.TimeEntrySortService) timeEntrySortService: ITimeEntrySortService) {
    super(logService, openprojectService);
    this.timeEntrySortService = timeEntrySortService;
  }
  //#endregion

  //#region IDataService interface members ------------------------------------
  public setRoutes(router: IDataRouterService): void {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    router.post('/export/time-entries', this.exportTimeSheets.bind(this));
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
  }
  //#endregion

  //#region Callback methods --------------------------------------------------
  private async exportTimeSheets(routedRequest: RoutedRequest): Promise<DtoUntypedDataResponse> {
    return this.executeExport(
      //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      routedRequest.data,
      //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
      this.buildTimesheetTableRow(
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

    const result = this.buildTableFromRows(
      rows,
      exportRequest.layoutLines === TimeEntryLayoutLines.perEntry ?
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
      1,
      2
    );
    return result;
  }

  private buildFullDetailTable(entries: Array<DtoTimeEntry>, subtotal: TimeEntryLayoutSubtotal): Array<Array<TableCell>> {
    const result = new Array<Array<TableCell>>();
    let grandTotal: Subtotal<number>
    if (subtotal === TimeEntryLayoutSubtotal.none) {
      grandTotal = this.calculateGrandTotal(entries);
      result.push(
        ...this.timeEntrySortService
          .sortByDateAndTime(entries)
          .map((entry: DtoTimeEntry) => this.buildTimesheetTableRow(
            moment(entry.spentOn).format('DD.MM.YYYY'),
            entry.workPackage.subject,
            entry.start,
            entry.end,
            this.millisecondsAsString(moment.duration(entry.hours).asMilliseconds()),
            false)
          )
      );
    } else if (subtotal === TimeEntryLayoutSubtotal.dateAndWorkpackage || subtotal === TimeEntryLayoutSubtotal.workpackageAndDate) {
      const subtotals = new Array<Subtotal<[DtoWorkPackage, Date]>>();
      grandTotal = this.calculateSubtotalsForCondensedDetailTable(entries, subtotals, undefined, TimeEntryLayoutSubtotal.none);
      subtotals
        .sort((a: Subtotal<[DtoWorkPackage, Date]>, b: Subtotal<[DtoWorkPackage, Date]>) => {
          let result: number;
          if (subtotal === TimeEntryLayoutSubtotal.dateAndWorkpackage) {
            result = a.subTotalFor[1].getTime() - b.subTotalFor[1].getTime();
            if (result === 0) {
              result = a.subTotalFor[0].subject.localeCompare(b.subTotalFor[0].subject);
            }
          } else {
            result = a.subTotalFor[0].subject.localeCompare(b.subTotalFor[0].subject);
            if (result === 0) {
              result = a.subTotalFor[1].getTime() - b.subTotalFor[1].getTime();
            }
          }
          return result;
        })
        .forEach((sub: Subtotal<[DtoWorkPackage, Date]>) => {
          result.push(
            ...this.timeEntrySortService
              .sortByDateAndTime(entries.filter((entry: DtoTimeEntry) =>
                entry.workPackage.id === sub.subTotalFor[0].id && entry.spentOn.getTime() === sub.subTotalFor[1].getTime())
              )
              .map((entry: DtoTimeEntry) => this.buildTimesheetTableRow(
                moment(entry.spentOn).format('DD.MM.YYYY'),
                entry.workPackage.subject,
                entry.start,
                entry.end,
                this.millisecondsAsString(moment.duration(entry.hours).asMilliseconds()),
                false)
              )
          );
          const subTotalText = `${moment(sub.subTotalFor[1]).format('DD.MM.YYYY')} - ${(sub.subTotalFor[0]).subject}`;
          result.push(this.buildSubTotalLine(
            false,
            sub.toExportable(`Zwischensumme für ${subTotalText}`),
            4,
            true
          ));
        });

    } else if (subtotal === TimeEntryLayoutSubtotal.workpackage) {
      const subtotals = new Array<Subtotal<DtoWorkPackage>>();
      grandTotal = this.calculateSubtotalsForWorkPackage(entries, subtotals);
      subtotals
        .sort((a: Subtotal<DtoWorkPackage>, b: Subtotal<DtoWorkPackage>) => a.subTotalFor.subject.localeCompare(b.subTotalFor.subject))
        .forEach((sub: Subtotal<DtoWorkPackage>) => {
          result.push(
            ...this.timeEntrySortService
              .sortByDateAndTime(entries.filter((entry: DtoTimeEntry) => entry.workPackage.id === sub.subTotalFor.id))
              .map((entry: DtoTimeEntry) =>
                this.buildTimesheetTableRow(
                  moment(entry.spentOn).format('DD.MM.YYYY'),
                  entry.workPackage.subject,
                  entry.start,
                  entry.end,
                  this.millisecondsAsString(moment.duration(entry.hours).asMilliseconds()),
                  false)
              )
          );
          result.push(this.buildSubTotalLine(
            false,
            sub.toExportable(`Zwischensumme für ${sub.subTotalFor.subject}`),
            4,
            true)
          );
        });
    } else {
      const subtotals = new Array<Subtotal<Date>>();
      grandTotal = this.calculateSubtotalsForDate(entries, subtotals);
      subtotals
        .sort((a: Subtotal<Date>, b: Subtotal<Date>) => a.subTotalFor.getTime() - b.subTotalFor.getTime())
        .forEach((sub: Subtotal<Date>) => {
          result.push(
            ...this.timeEntrySortService
              .sortByProjectAndWorkPackageAndDate(entries.filter((entry: DtoTimeEntry) => entry.spentOn.getTime() === sub.subTotalFor.getTime()))
              .map((entry: DtoTimeEntry) =>
                this.buildTimesheetTableRow(
                  moment(entry.spentOn).format('DD.MM.YYYY'),
                  entry.workPackage.subject,
                  entry.start,
                  entry.end,
                  this.millisecondsAsString(moment.duration(entry.hours).asMilliseconds()),
                  false)
              )
          );
          result.push(this.buildSubTotalLine(
            false,
            sub.toExportable(`Zwischensumme für ${moment(sub.subTotalFor).format('DD.MM.YYYY')}`),
            4,
            true)
          );
        });
    }
    // add the grand total line
    result.push(this.buildSubTotalLine(
      false,
      grandTotal.toExportable('Summe'),
      4,
      true)
    );
    return result;
  }

  private buildCondensedDetailTable(entries: Array<DtoTimeEntry>, subtotal: TimeEntryLayoutSubtotal): Array<Array<TableCell>> {
    const result = new Array<Array<TableCell>>();
    const detailLines = new Array<Subtotal<[DtoWorkPackage, Date]>>();
    const subTotals = new Array<Subtotal<DtoWorkPackage | Date>>();
    const grandTotal = this.calculateSubtotalsForCondensedDetailTable(entries, detailLines, subTotals, subtotal);

    if (subtotal !== TimeEntryLayoutSubtotal.none) {
      this
        .sortSubtotalsForDateOrWorkPackage(subTotals, subtotal)
        .forEach((sub: Subtotal<DtoWorkPackage | Date>) => {
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
          result.push(
            ...filtered.map((line: Subtotal<[DtoWorkPackage, Date]>) => this.buildTimesheetTableRow(
              moment(line.subTotalFor[1]).format('DD.MM.YYYY'),
              line.subTotalFor[0].subject,
              undefined,
              undefined,
              line.totalAsString,
              false)
            )
          );
          const subTotalText = subtotal === TimeEntryLayoutSubtotal.date ?
            moment(sub.subTotalFor as Date).format('DD.MM.YYYY') :
            (sub.subTotalFor as DtoWorkPackage).subject;
          result.push(this.buildSubTotalLine(
            false,
            sub.toExportable(`Zwischensumme für ${subTotalText}`),
            2,
            true)
          );
        });
    } else {
      detailLines.sort((a: Subtotal<[DtoWorkPackage, Date]>, b: Subtotal<[DtoWorkPackage, Date]>) => {
        let result = a.subTotalFor[1].getTime() - b.subTotalFor[1].getTime();
        if (result === 0) {
          result = a.subTotalFor[0].subject.localeCompare(b.subTotalFor[0].subject);
        }
        return result;
      });
      result.push(
        ...detailLines.map((line: Subtotal<[DtoWorkPackage, Date]>) => this.buildTimesheetTableRow(
          moment(line.subTotalFor[1]).format('DD.MM.YYYY'),
          line.subTotalFor[0].subject,
          undefined,
          undefined,
          line.totalAsString,
          false)
        )
      );
    }
    // add the grand total line
    result.push(this.buildSubTotalLine(
      false,
      grandTotal.toExportable('Summe'),
      2,
      true)
    );
    return result;
  }

  private calculateGrandTotal(entries: Array<DtoTimeEntry>): Subtotal<number> {
    const result = new Subtotal(0, '0', false);
    entries.forEach((entry: DtoTimeEntry) => {
      result.addTime(entry.hours, false);
    });
    return result;
  }

  private calculateSubtotalsForWorkPackage(entries: Array<DtoTimeEntry>, subtotals: Array<Subtotal<DtoWorkPackage>>): Subtotal<number> {
    const result = new Subtotal(0, '0', false);
    entries.forEach((entry: DtoTimeEntry) => {
      result.addTime(entry.hours, false);
      const toUpdate = subtotals.find((sub: Subtotal<DtoWorkPackage>) => sub.subTotalFor.id === entry.workPackage.id);
      if (toUpdate) {
        toUpdate.addTime(entry.hours, false);
      } else {
        subtotals.push(new Subtotal<DtoWorkPackage>(entry.workPackage, entry.hours, false));
      }
    });
    return result;
  }

  private calculateSubtotalsForDate(entries: Array<DtoTimeEntry>, subtotals: Array<Subtotal<Date>>): Subtotal<number> {
    const result = new Subtotal(0, '0', false);
    entries.forEach((entry: DtoTimeEntry) => {
      result.addTime(entry.hours, false);
      const toUpdate = subtotals.find((sub: Subtotal<Date>) => sub.subTotalFor.getTime() === entry.spentOn.getTime());
      if (toUpdate) {
        toUpdate.addTime(entry.hours, false);
      } else {
        subtotals.push(new Subtotal<Date>(entry.spentOn, entry.hours, false));
      }
    });
    return result;
  }

  private calculateSubtotalsForCondensedDetailTable(
    entries: Array<DtoTimeEntry>,
    detailLines: Array<Subtotal<[DtoWorkPackage, Date]>>,
    subtotals: Array<Subtotal<DtoWorkPackage | Date>>,
    subtotal: TimeEntryLayoutSubtotal): Subtotal<number> {
    const result = new Subtotal(0, '0', false);
    entries.forEach((entry: DtoTimeEntry) => {
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

  private sortSubtotalsForDateOrWorkPackage(
    subtotals: Array<Subtotal<DtoWorkPackage | Date>>,
    subtotal: TimeEntryLayoutSubtotal): Array<Subtotal<DtoWorkPackage | Date>> {
    subtotals.sort((a: Subtotal<DtoWorkPackage | Date>, b: Subtotal<DtoWorkPackage | Date>) => {
      if (subtotal === TimeEntryLayoutSubtotal.date) {
        return (a.subTotalFor as Date).getTime() - (b.subTotalFor as Date).getTime();
      } else {
        return (a.subTotalFor as DtoWorkPackage).subject.localeCompare((b.subTotalFor as DtoWorkPackage).subject);
      }
    });
    return subtotals;
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

  private buildTimesheetTableRow(date: string, task: string, from: string | undefined, to: string | undefined, time: string, bold: boolean): Array<TableCell> {
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

  //#endregion
}