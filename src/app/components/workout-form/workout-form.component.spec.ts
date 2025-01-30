import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutFormComponent } from './workout-form.component';
import { WorkoutService } from '../../services/workout.service';
import { NgForm } from '@angular/forms';

describe('WorkoutFormComponent', () => {
  let component: WorkoutFormComponent;
  let fixture: ComponentFixture<WorkoutFormComponent>;
  let mockWorkoutService: jasmine.SpyObj<WorkoutService>;

  beforeEach(async () => {
    // Create a spy object for WorkoutService with required methods
    mockWorkoutService = jasmine.createSpyObj<WorkoutService>('WorkoutService', [
      'getWorkoutTypes',
      'addWorkout'
    ]);

    await TestBed.configureTestingModule({
      imports: [WorkoutFormComponent], // Import standalone component
      providers: [
        { provide: WorkoutService, useValue: mockWorkoutService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutFormComponent);
    component = fixture.componentInstance;

    // Mock return value for service method
    mockWorkoutService.getWorkoutTypes.and.returnValue(['Running', 'Cycling']);
    
    fixture.detectChanges(); // Triggers ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize workout types from service on init', () => {
    expect(mockWorkoutService.getWorkoutTypes).toHaveBeenCalled();
    expect(component.workoutTypes).toEqual(['Running', 'Cycling']);
  });

  it('should have initial form values set to empty/zero', () => {
    expect(component.name).toBe('');
    expect(component.workoutType).toBe('');
    expect(component.minutes).toBe(0);
  });

  describe('onSubmit', () => {
    it('should call service and reset form when valid', () => {
      const mockForm = { valid: true, resetForm: jasmine.createSpy() } as unknown as NgForm;
      
      component.name = 'Morning Run';
      component.workoutType = 'Running';
      component.minutes = 45;

      component.onSubmit(mockForm);

      // Verify service call
      expect(mockWorkoutService.addWorkout).toHaveBeenCalledWith('Morning Run', {
        type: 'Running',
        minutes: 45
      });

      // Verify form reset
      expect(mockForm.resetForm).toHaveBeenCalled();
      expect(component.name).toBe('');
      expect(component.workoutType).toBe('');
      expect(component.minutes).toBe(0);
    });

    it('should not call service when form is invalid', () => {
      const mockForm = { valid: false } as NgForm;
      
      component.onSubmit(mockForm);
      expect(mockWorkoutService.addWorkout).not.toHaveBeenCalled();
    });
  });

  it('should render workout types in the select options', () => {
    fixture.detectChanges(); // Update template with initialized workoutTypes

    const select = fixture.nativeElement.querySelector('select');
    const options = select.querySelectorAll('option');

    // Includes default option + 2 mock types
    expect(options.length).toBe(3); 
    expect(options[1].textContent).toContain('Running');
    expect(options[2].textContent).toContain('Cycling');
  });

  it('should log available workout types on init', () => {
    const consoleSpy = spyOn(console, 'log');
    component.ngOnInit();
    expect(consoleSpy).toHaveBeenCalledWith('Available workout types:', ['Running', 'Cycling']);
  });
});