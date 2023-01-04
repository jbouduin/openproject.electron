import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './components/main/main.component';
import { CacheDialogComponent } from './components/cache-dialog/cache-dialog.component';
import { CoreModule } from '@core';


@NgModule({
  declarations: [
    MainComponent,
    CacheDialogComponent
  ],
  imports: [
    CommonModule,
    CoreModule
  ]
})
export class InfoModule { }
