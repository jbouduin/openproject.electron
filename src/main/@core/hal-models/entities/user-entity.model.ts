import { HalProperty } from "hal-rest-client";
import { EntityModel } from "./entity.model";

export class UserEntityModel extends EntityModel {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  public name: string;

  @HalProperty()
  public login: string;

  @HalProperty()
  public admin: boolean;

  @HalProperty()
  public firstName: string;

  @HalProperty()
  public lastName: string;

  @HalProperty()
  public email: string;

  @HalProperty()
  public avatar: string;

  @HalProperty()
  public status: 'active' | 'registered' | 'locked' | 'invited';
  // </editor-fold>
}
