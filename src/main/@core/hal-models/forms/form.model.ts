import { HalProperty, HalResource } from "hal-rest-client";
import { EntityModel } from "../entities/entity.model";
import { SchemaModel } from "./schema.model";
import { ValidationErrorsModel } from "./validation-errors.model";

export abstract class FormModel<Ent extends EntityModel> extends HalResource {

  // <editor-fold desc='Public properties'>
  @HalProperty()
  public schema: SchemaModel;

  @HalProperty()
  public validationErrors: ValidationErrorsModel;

  @HalProperty()
  public validate: FormModel<Ent>;

  @HalProperty()
  public commit: EntityModel;
  // </editor-fold>

  // <editor-fold desc='Abstract public properties'>
  // payload is abstract, as I can not find a way to define the @HalProperty() generically
  public abstract payload: Ent;
  // </editor-fold>
}
