import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InvalidLaunchComponent} from './invalid-launch.component';

describe('InvalidLaunchComponent', () => {
  let component: InvalidLaunchComponent;
  let fixture: ComponentFixture<InvalidLaunchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvalidLaunchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvalidLaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
