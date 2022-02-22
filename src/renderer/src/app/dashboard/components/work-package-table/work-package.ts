import { DtoWorkPackage } from '@common';
import * as moment from 'moment';

export class WorkPackage {
  private dtoWorkPackage: DtoWorkPackage;

  public get dueDate(): moment.Moment { return moment(this.dtoWorkPackage.dueDate); }
  public get derivedDueDate(): moment.Moment { return moment(this.dtoWorkPackage.derivedDueDate) };
  public get type(): string { return this.dtoWorkPackage.type.name; }
  public get project(): string { return this.dtoWorkPackage.project.name; }
  public get parentId(): number { return this.dtoWorkPackage.parent?.id; }
  public get parentSubject(): string { return this.dtoWorkPackage.parent?.subject; }
  public get id(): number { return this.dtoWorkPackage.id; }
  public get subject(): string { return this.dtoWorkPackage.subject; }

  constructor(dtoWorkPackage: DtoWorkPackage) {
    this.dtoWorkPackage = dtoWorkPackage;
  }
}
