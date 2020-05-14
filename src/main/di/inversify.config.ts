import { Container } from 'inversify';

import { ISomeService, SomeService } from '../some.service';

import SERVICETYPES from './service.types';

const container = new Container();

// <editor-fold desc='Services'>
container.bind<ISomeService>(SERVICETYPES.SomeService).to(SomeService);
// </editor-fold>

export default container;
