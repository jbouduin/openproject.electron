import { HalResource, HalProperty } from "hal-rest-client";
import { WorkPackageStatusEntityModel } from "../entities/work-package-status-entity.model";

export class QueryGroupModel extends HalResource {
  @HalProperty()
  public value: string;

  @HalProperty()
  public count: number

  @HalProperty(WorkPackageStatusEntityModel)
  public valueLink: Array<WorkPackageStatusEntityModel>;
}