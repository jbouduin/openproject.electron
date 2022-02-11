import { HalProperty } from '@jbouduin/hal-rest-client';
import { EntityModel } from './entity.model';

export class WorkPackageStatusEntityModel extends EntityModel {

  //#region Workpackage properties --------------------------------------------
  @HalProperty()
  public name: string;

  @HalProperty()
  public isClosed: boolean;

  @HalProperty()
  public color: string;

  @HalProperty()
  public isDefault: boolean;

  @HalProperty()
  public isReadonly: boolean;

  @HalProperty()
  public defaultDoneRatio: number;

  @HalProperty()
  public position: number;
  //#endregion
}
