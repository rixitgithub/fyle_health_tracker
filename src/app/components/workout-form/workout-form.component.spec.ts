import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutFormComponent } from './workout-form.component';
import { WorkoutService } from '../../services/workout.service';
import { NgForm } from '@angular/forms';

describe('WorkoutFormComponent', () => {
  let component: WorkoutFormComponent;
  let fixture: ComponentFixture<WorkoutFormComponent>;
  let mockWorkoutService: jasmine.SpyObj<WorkoutService>;

  beforeEach(async () => {
    mockWorkoutService = jasmine.createSpyObj<WorkoutService>(
      'WorkoutService',
      ['getWorkoutTypes', 'addWorkout']
    );

    // Provide the stub for workout types
    mockWorkoutService.getWorkoutTypes.and.returnValue(['Running', 'Cycling']);

    await TestBed.configureTestingModule({
      imports: [WorkoutFormComponent],
      providers: [{ provide: WorkoutService, useValue: mockWorkoutService }],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize workout types from service on init', () => {
    expect(mockWorkoutService.getWorkoutTypes).toHaveBeenCalled();
    expect(component.workoutTypes).toEqual(['Running', 'Cycling']);
  });

  // Now expecting minutes to be 30 by default (and reset to 30 after submit)
  it('should have initial form values set to empty and minutes to 30', () => {
    expect(component.name).toBe('');
    expect(component.workoutType).toBe('');
    expect(component.minutes).toBe(30);
  });

  describe('onSubmit', () => {
    it('should call service and reset form when valid', () => {
      const mockForm = {
        valid: true,
        resetForm: jasmine.createSpy(),
      } as unknown as NgForm;

      // Set form values
      component.name = 'Morning Run';
      component.workoutType = 'Running';
      component.minutes = 45;

      component.onSubmit(mockForm);

      // Verify the service was called with the correct parameters
      expect(mockWorkoutService.addWorkout).toHaveBeenCalledWith(
        'Morning Run',
        {
          type: 'Running',
          minutes: 45,
        }
      );

      // Verify that the form was reset and component properties reset to their defaults.
      expect(mockForm.resetForm).toHaveBeenCalled();
      expect(component.name).toBe('');
      expect(component.workoutType).toBe('');
      // Minutes should be reset to 30
      expect(component.minutes).toBe(30);
    });

    it('should not call service when form is invalid', () => {
      const mockForm = { valid: false } as NgForm;
      component.onSubmit(mockForm);
      expect(mockWorkoutService.addWorkout).not.toHaveBeenCalled();
    });
  });

  it('should render workout types in the select options', () => {
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select');
    const options = select.querySelectorAll('option');
    // Assuming the first option is a placeholder, we expect 3 options total.
    expect(options.length).toBe(3);
    expect(options[1].textContent).toContain('Running');
    expect(options[2].textContent).toContain('Cycling');
  });
});
