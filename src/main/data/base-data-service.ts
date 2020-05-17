import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { DtoBaseFilter } from '@ipc';
import { ILogService, IOpenprojectService } from '@core';

@injectable()
export abstract class BaseDataService {

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    protected logService: ILogService,
    protected openprojectService: IOpenprojectService) { }
  // </editor-fold>

  // <editor-fold desc='Protected methods'>
  protected buildUri(baseUri: string, filter: DtoBaseFilter): string {
    if (filter) {
      const query = new Array<string>();
      if (filter.offset) {
        query.push(`offset=${filter.offset}`);
      }
      if (filter.pageSize) {
        query.push(`pageSize=${filter.pageSize}`);
      }
      if (filter.sortBy) {
        query.push(`sortBy=${filter.sortBy}`);
      }
      if (query.length > 0) {
        baseUri += `?${query.join(',')}`;
      }
    }
    return baseUri;
  }
  // </editor-fold>
}
