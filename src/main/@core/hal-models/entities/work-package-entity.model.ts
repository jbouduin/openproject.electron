import { HalProperty } from "hal-rest-client";
import { FormattableModel } from "../formattable.model";
import { EntityModel } from "./entity.model";
import { ProjectEntityModel } from "./project-entity.model";
import { WorkPackageTypeEntityModel } from "./work-package-type-entity.model";

export class WorkPackageEntityModel extends EntityModel {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  lockVersion: number;

  @HalProperty()
  subject: string;

  @HalProperty()
  description: FormattableModel;

  @HalProperty()
  startDate: Date;

  @HalProperty()
  dueDate: Date;

  @HalProperty()
  parent: WorkPackageEntityModel;

  @HalProperty()
  project: ProjectEntityModel;

  @HalProperty()
  type: WorkPackageTypeEntityModel;

  @HalProperty()
  customField6: boolean;
  // </editor-fold>
}
