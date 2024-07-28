import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilmsEditChildComponent } from './films-edit-child.component';

describe('FilmsEditChildComponent', () => {
  let component: FilmsEditChildComponent;
  let fixture: ComponentFixture<FilmsEditChildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmsEditChildComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FilmsEditChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
