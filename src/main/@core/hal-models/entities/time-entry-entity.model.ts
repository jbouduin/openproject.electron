import { HalProperty } from "hal-rest-client";
import { EntityModel } from "./entity.model";
import { FormattableModel } from "../formattable.model";
import { ProjectEntityModel } from "./project-entity.model";
import { TimeEntryActivityEntityModel } from "./time-entry-activity-entity.model";
import { UserEntityModel } from "./user-entity.model";
import { WorkPackageEntityModel } from "./work-package-entity.model";

export class TimeEntryEntityModel extends EntityModel {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  public comment: FormattableModel;

  @HalProperty()
  public spentOn: Date;

  @HalProperty()
  public hours: string;

  @HalProperty()
  public customField2: string;

  @HalProperty()
  public customField3: string;

  @HalProperty()
  public customField5: boolean;

  @HalProperty()
  public project: ProjectEntityModel;

  @HalProperty()
  public activity: TimeEntryActivityEntityModel;

  @HalProperty()
  public user: UserEntityModel;

  @HalProperty()
  public workPackage: WorkPackageEntityModel;
  // </editor-fold>
}
