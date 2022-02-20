import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CoreModule } from '@core';

import { NavListComponent } from './components/nav-list/nav-list.component';
import { HeaderComponent } from './components/header/header.component';
import { ShellComponent } from './components/shell/shell.component';
import { SnackBarComponent } from './components/snack-bar/snack-bar.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SettingsDialogComponent } from './components/settings-dialog/settings-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [NavListComponent, HeaderComponent, ShellComponent, SnackBarComponent, SettingsDialogComponent],
  imports: [
    CommonModule,
    RouterModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
  ],
  exports: [ ShellComponent ]
})
export class ShellModule { }
