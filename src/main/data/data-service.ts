import { IDataRouterService } from './data-router.service';

export interface IDataService {
  setRoutes(router: IDataRouterService): void;
}
