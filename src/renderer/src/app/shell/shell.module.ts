import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CoreModule } from '@core';

import { NavListComponent } from './nav-list/nav-list.component';
import { HeaderComponent } from './header/header.component';
import { ShellComponent } from './shell/shell.component';

@NgModule({
  declarations: [NavListComponent, HeaderComponent, ShellComponent],
  imports: [
    CommonModule,
    RouterModule,
    CoreModule
  ],
  exports: [ ShellComponent ]
})
export class ShellModule { }
