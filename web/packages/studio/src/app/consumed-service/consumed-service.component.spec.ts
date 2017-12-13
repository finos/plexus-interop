import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumedServiceComponent } from './consumed-service.component';

describe('ConsumedServiceComponent', () => {
  let component: ConsumedServiceComponent;
  let fixture: ComponentFixture<ConsumedServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumedServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumedServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
