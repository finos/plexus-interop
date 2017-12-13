import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppServicesComponent } from './app-services.component';

describe('AppServicesComponent', () => {
  let component: AppServicesComponent;
  let fixture: ComponentFixture<AppServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
