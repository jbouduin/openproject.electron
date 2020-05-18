import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from '@core';
import { ShellModule } from './shell/shell.module';

import { TimeEntryModule } from './time-entry/time-entry.module';
import { TimeEntryRoutingModule } from './time-entry/time-entry-routing.module';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Component1Component } from './components/component1/component1.component';
import { Component2Component } from './components/component2/component2.component';


@NgModule({
  declarations: [
    AppComponent,
    Component1Component,
    Component2Component
  ],
  imports: [
    BrowserModule,
    CoreModule,
    TimeEntryModule,
    TimeEntryRoutingModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ShellModule
  ],
  providers: [],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
