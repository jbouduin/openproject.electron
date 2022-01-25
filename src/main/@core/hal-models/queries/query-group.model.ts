import { HalResource, HalProperty } from '@jbouduin/hal-rest-client';
import { WorkPackageStatusEntityModel } from '../entities/work-package-status-entity.model';

export class QueryGroupModel extends HalResource {
  @HalProperty()
  public value: string;

  @HalProperty()
  public count: number

  @HalProperty({ resourceType: WorkPackageStatusEntityModel })
  public valueLink: Array<WorkPackageStatusEntityModel>;
}