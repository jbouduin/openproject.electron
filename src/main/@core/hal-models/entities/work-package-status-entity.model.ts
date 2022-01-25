import { HalProperty } from '@jbouduin/hal-rest-client';
import { EntityModel } from './entity.model';

export class WorkPackageStatusEntityModel extends EntityModel {

  //#region Public properties -------------------------------------------------
  @HalProperty()
  name: string;

  @HalProperty()
  isClosed: boolean;

  @HalProperty()
  color: string;

  @HalProperty()
  isDefault: boolean;

  @HalProperty()
  isReadonly: boolean;

  @HalProperty()
  defaultDoneRatio: number;

  @HalProperty()
  position: number;
  //#endregion
}
