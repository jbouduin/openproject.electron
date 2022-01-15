import { injectable } from 'inversify';
import 'reflect-metadata';
import { DtoBaseFilter, DtoUntypedDataResponse, DataStatus, DataStatusKeyStrings, LogSource } from '@ipc';
import { ILogService, IOpenprojectService } from '@core';
import { EntityModel } from '@core/hal-models';
import { HalResource } from 'hal-rest-client';
import { IHalResourceConstructor } from 'hal-rest-client/dist/hal-resource-interface';

@injectable()
export abstract class BaseDataService {

  // <editor-fold desc='Protected properties'>
  protected logService: ILogService;
  // TODO check if we need this openprojectservice in the dataservices
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

  protected async preFetchLinks<M extends EntityModel, L extends HalResource>(
      elements: Array<M>,
      type: IHalResourceConstructor<L>,
      linkFn: (m: M) => L,
      setFn: (m: M, l: L) => void
    ): Promise<void> {
    // make sure that all resources are fetched at least once
    await Promise.all(elements
      .filter(element => linkFn(element) && linkFn(element).uri?.uri && !linkFn(element).isLoaded)
      .map(element => linkFn(element))
      .filter((element, i, arr) => arr.findIndex(t => t.uri.uri === element.uri.uri) === i)
      .map(link => {
        this.logService.verbose(LogSource.Main, 'prefetch', link.uri.uri);
        return link.fetch();
      })
    );
    elements
      .filter(element => linkFn(element) && linkFn(element).uri?.uri && !linkFn(element).isLoaded)
      .forEach(element => {
        this.logService.verbose(LogSource.Main, 'setting prefetched', linkFn(element).uri.uri, 'for', element.id);
        setFn(element, this.openprojectService.createFromCache(type, linkFn(element).uri));
        if (!linkFn(element).isLoaded) {
          console.log(`did not succeed to load ${linkFn(element).uri?.uri} into ${element.uri.uri}`);
        } else {
          console.log(`succeeded to load ${linkFn(element).uri?.uri} into ${element.uri.uri}`);
        }
      });
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
