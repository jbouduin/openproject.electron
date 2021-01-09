import { isUndefined } from 'lodash';
import { Content, ContextPageSize, TableCell, TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';
import * as moment from 'moment';
import * as fs from 'fs';
import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';
import * as path from 'path';
import { IProcessor } from "../processor-factory";

const PdfPrinter = require('pdfmake');

class DirectoryInfo {
  private _directoryName: string;

  public get directoryFullPath(): string {
    return path.resolve(this._directoryName);
  }

  public get directoryExists(): boolean {
    return fs.existsSync(this._directoryName) && fs.lstatSync(this._directoryName).isDirectory();
  }

  public get directoryName(): string {
    return this._directoryName;
  }

  public constructor(name: string) {
    this._directoryName = name;
  }

}

class OutputFileInfo extends DirectoryInfo {
  private _fileName: string;

  public get fileName(): string {
    return this._fileName;
  }

  public get fileExists(): boolean {
    return fs.existsSync(this.fileFullPath) && fs.lstatSync(this.fileFullPath).isFile();
  }

  public get fileFullPath(): string {
    return path.join(this.directoryFullPath, this._fileName);
  }

  public constructor(name: string) {
    super(path.dirname(name));
    if (path.extname(name.toLowerCase()) !== '.pdf') {
      this._fileName = path.basename(name) + '.pdf';
    } else {
      this._fileName = path.basename(name);
    }
  }
}

export class TimesheetProcessor implements IProcessor {
  private pdfPointInMillimeters = 0.352777778;
  private footerImage: string;
  private headerImage: string;

  private optionList = [
    {
      name: 'static',
      alias: 's',
      description: 'The directory with the static contents. It has a few subdirectories, containing template files, font files and images',
      type: (directoryName: string) => new DirectoryInfo(directoryName),
      typeLabel: '{underline directory}'
    },
    {
      name: 'target',
      alias: 't',
      description: 'The output filename. This argument can include the absolute or relative path to the file.',
      type: (fileName: string) => new OutputFileInfo(fileName),
      typeLabel: '{underline filename}'
    },
    {
      name: 'force-directory',
      alias: 'f',
      description: 'Create the output directory if it does not exist.',
      type: Boolean
    },
    {
      name: 'overwrite',
      alias: 'o',
      description: 'Overwrite the output file if it already exists.',
      type: Boolean
    },

  ];

  public printHelp(): void {
    const sections = [
      {
        header: 'openproject.electron timesheet generator. Currently just hardcoded',
        content: 'Generate a timesheet pdf.'
      },
      {
        header: 'Synopsis',
        content: '$ cli timesheet [Options ...]'
      },
      {
        header: 'Available Options',
        optionList: this.optionList
      }
    ];

    const usage = commandLineUsage(sections);
    console.log(usage);
  }

  public process(argv: any): void {
    const commandOptions = commandLineArgs(this.optionList, { argv, camelCase: true });
    let hasError = false;
    if (isUndefined(commandOptions.static)) {
      console.log('Missing argument: --static');
      hasError = true;
    } else if (!commandOptions.static.directoryExists) {
      console.log(`Argument --static: directory '${commandOptions.static.name}' does not exist`);
      hasError = true;
    }

    if (isUndefined(commandOptions.target)) {
      console.log('Missing argument: --target');
      hasError = true;
    } else if (!commandOptions.target.directoryExists && !commandOptions.forceDirectory) {
      console.log(`Argument --target: directory '${commandOptions.target.directoryName}' does not exist. Specify the '--force-output' flag to create the directory.`);
      hasError = true;
    } else if (commandOptions.target.fileExists && !commandOptions.overwrite) {
      console.log(`Argument --target: file '${commandOptions.target.fileFullPath}' already exist. Specify the '--overwrite' flag to overwrite the existing file.`);
      hasError = true;
    }
    if (hasError) {
      console.log('Use \'cli help timesheet\' for more information.')
      return;
    }

    const docDefinition = this.buildPdf(commandOptions.static);
    const printer = new PdfPrinter(this.getFonts());
    const pdfDoc = printer.createPdfKitDocument(docDefinition); //, { tableLayouts: this.myTableLayouts.bind(this) });

    const stream = fs.createWriteStream(commandOptions.target.fileFullPath);
    // this gives an error spawn UNKNOWN
    // alternative npm: install open
    // stream.addListener(
    //   'close',
    //   () => {
    //     console.log('options', commandOptions.target.fileFullPath);
    //     console.log(fs.existsSync(commandOptions.target.fileFullPath));
    //     execFile(commandOptions.target.fileFullPath);
    //   }
    // );
    pdfDoc.pipe(stream);
    pdfDoc.end();
  }

  private buildPdf(staticDirectory: DirectoryInfo): TDocumentDefinitions {
    this.footerImage = path.join(staticDirectory.directoryFullPath, 'images', 'footer.png');
    this.headerImage = path.join(staticDirectory.directoryFullPath, 'images', 'header.png');

    const portraitDefinition = fs.readFileSync(path.join(staticDirectory.directoryFullPath, 'pdf', 'portrait.json'), 'utf-8');
    const docDefinition = JSON.parse(portraitDefinition) as TDocumentDefinitions;
    docDefinition.content = [
      {
        text: 'Stundennachweis für Januar 2021',
        fontSize: 24,
        bold: true,
        decoration: 'underline',
        alignment: 'center',
        margin: [0, 25 / this.pdfPointInMillimeters]
      }
    ];
    docDefinition.content.push(this.buildEntryTable());
    docDefinition.content.push(this.buildSignatureTable());
    docDefinition.pageMargins = [
      15 / this.pdfPointInMillimeters, // left
      36 / this.pdfPointInMillimeters, // top
      15 / this.pdfPointInMillimeters, // right
      33.5 / this.pdfPointInMillimeters // bottom
    ];
    docDefinition.defaultStyle = {
      font: 'Times'
    };
    docDefinition.header = this.buildHeader.bind(this);
    docDefinition.footer = this.buildFooter.bind(this);
    return docDefinition;
  }

  private buildSignatureTable(): Content {
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
          10 / this.pdfPointInMillimeters,
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
              text: 'Johan Bouduin, Aßling, 31.01.2021',
              fontSize: 11,
              border: underline
            },
            {
              text: '',
              border: noBorder
            },
            {
              text: 'Christian Fridgen (Head of IT-Tools), Ebersberg',
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

  private buildEntryTable(): Content {
    const rows = new Array<Array<TableCell>>();
    rows.push(this.buildTableRow('Datum', 'Aufgabe', 'Von', 'Bis', 'Zeit', true));
    var a = moment('2021-01-01');
    var b = moment('2021-01-31');

    for (var m = moment(a); m.isSameOrBefore(b); m.add(1, 'days')) {
      if (m.weekday() != 0 && m.weekday() != 6) {
        rows.push(this.buildTableRow(m.format('DD.MM.YYYY'), 'Something I had to do', '09:00', '12:00', '03:00', false));
        rows.push(this.buildTableRow(m.format('DD.MM.YYYY'), 'Something I had to do', '12:30', '17:30', '05:00', false));
      }
    }
    rows.push([
      {
        text: 'Summe',
        bold: true,
        colSpan: 4,
        alignment: 'right'
      }, {}, {}, {},
      {
        text: '320:30',
        bold: true,
        alignment: 'center'
      }
    ]);
    const result: Content = {
      table: {
        headerRows: 1,
        keepWithHeaderRows: 3,
        widths: [
          25 / this.pdfPointInMillimeters,
          '*',
          15 / this.pdfPointInMillimeters,
          15 / this.pdfPointInMillimeters,
          15 / this.pdfPointInMillimeters
        ],
        body: rows,
      }
    };

    return result;
  }

  private buildTableRow(date: string, task: string, from: string, to: string, time: string, bold: boolean): Array<unknown> {
    const result: Array<TableCell> = [
      {
        text: date,
        alignment: 'center',
        bold: bold
      },
      {
        text: task,
        alignment: 'left',
        bold: bold
      },
      {
        text: from,
        alignment: 'center',
        bold: bold
      },
      {
        text: to,
        alignment: 'center',
        bold: bold
      },
      {
        text: time,
        alignment: 'center',
        bold: bold
      }
    ];
    return result;
  }

  private buildFooter(currentPage: number, pageCount: number, pageSize: ContextPageSize): any {
    return [
      {
        columns: [
          {
            text: 'Stundennachweis Johan Bouduin',
            alignment: 'left',
            fontSize: 11
          },
          {
            text: `Seite ${currentPage} / ${pageCount}`,
            alignment: 'right',
            fontSize: 11
          }
        ],
        margin: [15 / this.pdfPointInMillimeters, 11 / this.pdfPointInMillimeters, 15 / this.pdfPointInMillimeters, 1 / this.pdfPointInMillimeters]
      },
      {
        image: this.footerImage,
        width: pageSize.width - (30 / this.pdfPointInMillimeters),
        margin: [15 / this.pdfPointInMillimeters, 0.25 / this.pdfPointInMillimeters]
      }
    ];
  }

  private buildHeader(_currentPage: number, _pageCount: number, pageSize: ContextPageSize): any {
    return [
      {
        image: this.headerImage,
        width: pageSize.width - (30 / this.pdfPointInMillimeters),
        absolutePosition: {
          "x": 15 / this.pdfPointInMillimeters,
          "y": 10 / this.pdfPointInMillimeters
        }
      }
    ];
  }

  private getFonts(): TFontDictionary {
    const result: TFontDictionary = {
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
      },
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      },
      Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
      },
      Symbol: {
        normal: 'Symbol'
      },
      ZapfDingbats: {
        normal: 'ZapfDingbats'
      }
    };
    return result;
  }
}