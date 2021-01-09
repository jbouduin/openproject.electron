import { isUndefined } from 'lodash';
import { ProcessorFactory } from './processor-factory';
import * as commandLineArgs from 'command-line-args';
import * as commandLineUsage from 'command-line-usage';

export class Main {
  public process(): void {

    const mainDefinitions = [
      { name: 'command', defaultOption: true },
      { name: 'help', alias: 'h', type: Boolean },
      { name: 'quiet', alias: 'a', type: Boolean },
      { name: 'verbose', alias: 'v', type: Boolean }
    ];
    const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
    const argv = mainOptions._unknown || [];

    if (isUndefined(mainOptions.command) || mainOptions.help) {
      this.printUsage();
    } else {
      switch (mainOptions.command) {
        case 'timesheet': {
          ProcessorFactory.timesheet.process(argv)
          break;
        }
        case 'help': {
          this.processHelp(argv);
          break;
        }
        default: {
          console.log('Unknown command:', mainOptions.command);
          this.printUsage();
        }
      }
    }
  }

  private printUsage(): void {
    const sections = [
      {
        header: 'openproject.electron command line interface',
        content: 'Some command line utilities related to the openproject electron app.'
      },
      {
        header: 'Synopsis',
        content: '$ cli <command> [<args>]'
      },
      {
        header: 'Available commands',
        content: [
          { name: 'help', summary: 'Display help information.' },
          { name: 'timesheet', summary: 'Generate a timesheet PDF.' }
        ]
      },
      {
        header: 'Global options',
        optionList: [
          {
            name: 'help',
            alias: 'h',
            description: 'Display this usage guide.',
            type: Boolean
          },
          {
            name: 'verbose',
            alias: 'v',
            description: 'Show debug information in the console. This option takes precedence over the \'quiet\' option.',
            type: Boolean
          },
          {
            name: 'quiet',
            alias: 'q',
            description: 'Suppress all output.',
            type: Boolean

          }
        ]
      },
      {
        content: 'See \'cli help <command>\' to read about a specific command.'
      }
    ];

    const usage = commandLineUsage(sections);
    console.log(usage);
  }

  private processHelp(argv: any): void {
    console.log(argv);
    const helpDefinitions = [
      { name: 'command', defaultOption: true }
    ];
    const helpOptions = commandLineArgs(helpDefinitions, { argv });
    console.log(helpOptions.command);
    switch (helpOptions.command) {
      case undefined: {
        this.printUsage();
        break;
      }
      case 'timesheet': {
        ProcessorFactory.timesheet.printHelp();
        break;
      }
      case 'help': {
        this.printUsage();
        break;
      }
      default: {
        console.log('Unknown command:', helpOptions.command);
        this.printUsage();
      }
    }
  }
}