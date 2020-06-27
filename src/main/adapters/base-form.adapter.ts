import { injectable } from 'inversify';
import 'reflect-metadata';

import { DtoBase, DtoBaseForm } from '@ipc';
import { EntityModel, FormModel, SchemaModel } from '@core/hal-models';
import { IBaseEntityAdapter } from './base-entity.adapter';
import { HalResource } from 'hal-rest-client';

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
  protected abstract processValidationErrors(errors: HalResource, form: DtoForm): Promise<void>
  // </editor-fold>

  // <editor-fold desc='IBaseAdapter interface methods'>
  public async resourceToDto(entityAdapter: IBaseEntityAdapter<Ent, DtoEntity>, form: FormModel<Ent>): Promise<DtoForm> {
    const result = this.createFormDto();
    result.payload = await entityAdapter.resourceToDto(form.payload);
    this.processSchema(form.schema, result);
    this.processValidationErrors(form.validationErrors, result);
    return result;
  }
  // </editor-fold>
}
