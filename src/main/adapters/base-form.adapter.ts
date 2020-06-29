import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoBaseForm, DtoValidationError } from '@ipc';
import { EntityModel, FormModel, SchemaModel, ValidationErrorsModel, ValidationErrorModel } from '@core/hal-models';
import { IBaseEntityAdapter } from './base-entity.adapter';

export interface IBaseFormAdapter<Ent extends EntityModel, DtoForm, DtoEntity>  {
  // createFormDto(): DtoForm;
  resourceToDto(entityAdapter: IBaseEntityAdapter<Ent, DtoEntity>, form: FormModel<Ent>): Promise<DtoForm>;
}

@injectable()
export abstract class BaseFormAdapter<Ent extends EntityModel, DtoForm extends DtoBaseForm<DtoEntity>, DtoEntity extends DtoBase>
  implements IBaseFormAdapter<Ent, DtoForm, DtoEntity> {

  // <editor-fold desc='Constructor & C°'>
  constructor() { }
  // </editor-fold>

  // <editor-fold desc='Abstract methods'>
  protected abstract createFormDto(): DtoForm;
  protected abstract processSchema(schema: SchemaModel, form: DtoForm ): Promise<void>;
  // protected abstract processValidationErrors(errors: ValidationErrorsModel, form: DtoForm): void;
  // </editor-fold>

  // <editor-fold desc='Protected methods'>
  protected processValidationErrors(errors: ValidationErrorsModel, form: DtoForm): void {
    let result = new Array<DtoValidationError>();
    const propNames = Object.keys(errors).filter( key => errors[key] instanceof ValidationErrorModel);
    propNames.forEach(prop => {
      this.extractValidationErrors(errors[prop]).forEach(err => result.push(err));
    });
    form.validationErrors = result;
  }

  protected extractValidationErrors(error: ValidationErrorModel): Array<DtoValidationError> {
    if (error.errors) {
      return error.errors.map(error => this.extractValidationError(error));
    } else {
      return [ this.extractValidationError(error) ];
    }
  }

  protected extractValidationError(error: ValidationErrorModel): DtoValidationError {
    const result: DtoValidationError = {
      name: error.details.attribute,
      message: error.message
    };
    return result;
  }
  // </editor-fold>

  // <editor-fold desc='IBaseAdapter interface methods'>
  public async resourceToDto(entityAdapter: IBaseEntityAdapter<Ent, DtoEntity>, form: FormModel<Ent>): Promise<DtoForm> {
    const result = this.createFormDto();
    result.self = form.uri?.uri;
    result.validate = form.validate?.uri?.uri;
    result.commit = form.commit?.uri?.uri;
    result.payload = await entityAdapter.resourceToDto(form.payload);
    this.processSchema(form.schema, result);
    this.processValidationErrors(form.validationErrors, result);

    return result;
  }
  // </editor-fold>
}
