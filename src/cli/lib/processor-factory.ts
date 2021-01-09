import { TimesheetProcessor } from "./timesheet/timesheet-processor";

export interface IProcessor {
  printHelp(): void;
  process(argv: any): void;
}

export class ProcessorFactory {
  public static get timesheet(): IProcessor {
    return new TimesheetProcessor();
  }
}