import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeEntryMainComponent } from './time-entry-main.component';

describe('TimeEntryComponent', () => {
  let component: TimeEntryMainComponent;
  let fixture: ComponentFixture<TimeEntryMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeEntryMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeEntryMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
