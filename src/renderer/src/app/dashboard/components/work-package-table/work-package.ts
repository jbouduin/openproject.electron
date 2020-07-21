import { DtoWorkPackage } from '@ipc';
import * as moment from 'moment';

export class WorkPackage {
  private dtoWorkPackage: DtoWorkPackage;

  public get dueDate(): moment.Moment { return moment(this.dtoWorkPackage.dueDate); }
  public get type(): string { return 'todo'; }
  public get project(): string { return 'todo'; }
  public get parentId(): number { return 0; }
  public get parentSubject(): string { return 'todo'; }
  public get id(): number { return this.dtoWorkPackage.id; }
  public get subject(): string { return this.dtoWorkPackage.subject; }

  constructor(dtoWorkPackage: DtoWorkPackage) {
    this.dtoWorkPackage = dtoWorkPackage;
  }
}
