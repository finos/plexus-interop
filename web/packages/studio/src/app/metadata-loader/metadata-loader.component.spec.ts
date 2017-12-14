import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataLoaderComponent } from './metadata-loader.component';

describe('MetadataLoaderComponent', () => {
  let component: MetadataLoaderComponent;
  let fixture: ComponentFixture<MetadataLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetadataLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
