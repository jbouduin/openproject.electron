import { Container } from 'inversify';

import { IDataRouterService, DataRouterService } from '../data';
import { ISystemService, SystemService } from '../data';

import SERVICETYPES from './service.types';

const container = new Container();

// <editor-fold desc='Services'>
container.bind<IDataRouterService>(SERVICETYPES.DataRouterService).to(DataRouterService).inSingletonScope();
container.bind<ISystemService>(SERVICETYPES.SystemService).to(SystemService);
// </editor-fold>

export default container;
