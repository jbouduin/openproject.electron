import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoBaseForm, DtoValidationError } from '@ipc';
import { EntityModel, FormModel, SchemaModel, ValidationErrorsModel } from '@core/hal-models';
import { IBaseEntityAdapter } from './base-entity.adapter';
import { IHalResource } from '@jbouduin/hal-rest-client';
import { ILogService } from '@core';
import { LogSource } from '@common';

export interface IBaseFormAdapter<Ent extends EntityModel, DtoForm, DtoEntity> {
  // createFormDto(): DtoForm;
  resourceToDto(entityAdapter: IBaseEntityAdapter<Ent, DtoEntity>, form: FormModel<Ent>): Promise<DtoForm>;
}

@injectable()
export abstract class BaseFormAdapter<Ent extends EntityModel, DtoForm extends DtoBaseForm<DtoEntity>, DtoEntity extends DtoBase>
  implements IBaseFormAdapter<Ent, DtoForm, DtoEntity> {

  //#region Abstract methods --------------------------------------------------
  protected abstract createFormDto(): DtoForm;
  protected abstract processSchema(schema: SchemaModel, form: DtoForm): Promise<DtoForm>;
  // protected abstract processValidationErrors(errors: ValidationErrorsModel, form: DtoForm): void;
  //#endregion

  //#region protected properties ----------------------------------------------
  protected logService: ILogService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(logService: ILogService) {
    this.logService = logService;
  }
  //#endregion

  //#region Protected methods -------------------------------------------------
  protected processValidationErrors(errors: ValidationErrorsModel, form: DtoForm): void {
    const result = new Array<DtoValidationError>();
    errors.propertyKeys.forEach(prop => {
      if (errors[prop]) {
        this.extractValidationErrors(errors[prop]).forEach(err => result.push(err));
      }
    });
    form.validationErrors = result;
  }

  protected extractValidationErrors(error: any): Array<DtoValidationError> {
    if (error.getProperty('errors')) {
      return error.getProperty('errors').map((error: any) => this.extractValidationError(error));
    } else {
      return [this.extractValidationError(error)];
    }
  }

  protected extractValidationError(error: any): DtoValidationError {
    const result: DtoValidationError = {
      name: error.details.attribute,
      message: error.message
    };
    return result;
  }
  //#endregion

  //#region IBaseAdapter interface methods ------------------------------------
  public async resourceToDto(entityAdapter: IBaseEntityAdapter<Ent, DtoEntity>, form: FormModel<Ent>): Promise<DtoForm> {
    const result = this.createFormDto();
    result.self = form.uri?.href;
    result.validate = form.validate?.uri?.href;
    result.commit = form.commit?.uri?.href;
    result.commitMethod = form.getLink<IHalResource>('commit')?.getProperty('method');
    result.payload = await entityAdapter
      .resourceToDto(form.payload)
      .catch((reason: any) => {
        this.logService.error(LogSource.Main, `Error converting the payload for form with URI ${result.self}`, reason);
        return undefined
      });
    return this
      .processSchema(form.schema, result)
      .then((dtoForm: DtoForm) => {
        try {
          this.processValidationErrors(form.validationErrors, dtoForm);
        } catch (error) {
          this.logService.error(LogSource.Main, `Error processing the validation errors for form with URI ${result.self}`, error);
        }
        return dtoForm
      })
      .catch((reason: any) => {
        this.logService.error(LogSource.Main, `Error processing the schema for form with URI ${result.self}`, reason);
        return result;
      });
  }
  //#endregion
}
