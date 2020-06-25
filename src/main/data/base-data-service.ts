import { injectable } from 'inversify';
import 'reflect-metadata';
import { DtoBaseFilter, DtoUntypedDataResponse, DataStatus, DataStatusKeyStrings, LogSource } from '@ipc';
import { ILogService, IOpenprojectService } from '@core';
import { HalResource } from 'hal-rest-client';

@injectable()
export abstract class BaseDataService {

  // <editor-fold desc='Protected properties'>
  protected logService: ILogService;
  protected openprojectService: IOpenprojectService;
  // </editor-fold>

  // <editor-fold desc='Protected abstract getters'>
  protected abstract get entityRoot(): string;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(logService: ILogService, openprojectService: IOpenprojectService) {
    this.logService = logService;
    this.openprojectService = openprojectService;
  }
  // </editor-fold>

  // <editor-fold desc='Protected methods'>
  protected buildUriWithFilter(baseUri: string, filter: DtoBaseFilter): string {
    if (filter) {
      const query = new Array<string>();
      query.push(`offset=${filter.offset}`);
      query.push(`pageSize=${filter.pageSize}`);
      if (filter.sortBy) {
        query.push(`sortBy=${encodeURIComponent(filter.sortBy)}`);
      }
      if (filter.filters) {
        query.push(`filters=${encodeURIComponent(filter.filters)}`);
      }
      if (query.length > 0) {
        baseUri += `?${query.join('&')}`;
      }
    }
    return baseUri;
  }

  protected async getUpdateForm(id: any): Promise<void> {
    const uri = `${this.entityRoot}/${id}/form`;
    try {
      // console.log(uri);
      const form = await this.openprojectService.createResource(uri, {}) as HalResource;
      // console.log(form.prop('payload'));

    } catch (error) {
      // console.log(error);
      this.processServiceError(error);
    }
  }

  protected processServiceError(error: any): DtoUntypedDataResponse {
    let status: DataStatus;
    let message: string;

    if (error.response?.status) {
      status = DataStatus[<DataStatusKeyStrings>error.response.status];
      if (status === undefined) {
        status = DataStatus.Error;
      }
      message = error.response.statusText;
      this.logService.error(
        LogSource.Main,
        {
          status: error.response.status,
          statusText: error.response.status,
          method: error.response.config.method,
          url: error.response.config.url,
          configData: error.response.config.data,
          data: error.response.data
        }
      );
    } else {
      status = DataStatus.Error;
      message = `${error.name}: ${error.message}`;
      this.logService.error(LogSource.Main, error);
    }

    const errorResponse: DtoUntypedDataResponse = { status, message }
    return errorResponse;
  }
  // </editor-fold>
}
