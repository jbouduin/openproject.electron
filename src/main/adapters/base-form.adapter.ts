import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoBaseForm, DtoValidationError } from '@ipc';
import { EntityModel, FormModel, SchemaModel, ValidationErrorsModel } from '@core/hal-models';
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
    Object.keys(errors).forEach(prop => {
      this.extractValidationErrors(errors[prop]).forEach(err => result.push(err));
    });
    form.validationErrors = result;
  }

  protected extractValidationErrors(error: any): Array<DtoValidationError> {
    // as the json for validation errors does not contain _links, hal-rest-client does not recognize it as HAL
    if (error._embedded.errors) {
      return error._embedded.errors.map( (error: any) => this.extractValidationError(error));
    } else {
      return [ this.extractValidationError(error) ];
    }
  }

  protected extractValidationError(error: any): DtoValidationError {
    const result: DtoValidationError = {
      name: error._embedded.details.attribute,
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
    result.commitMethod = form.links['commit']?.props?.method;
    result.payload = await entityAdapter.resourceToDto(form.payload);
    this.processSchema(form.schema, result);
    this.processValidationErrors(form.validationErrors, result);

    return result;
  }
  // </editor-fold>
}
