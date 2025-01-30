import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WorkoutService } from './workout.service';
import { User, Workout } from '../models/workout';

describe('WorkoutService', () => {
  let service: WorkoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load initial data', () => {
    const initialData = service['getInitialData']();
    expect(initialData.length).toBeGreaterThan(0);
  });

  it('should load data from local storage', () => {
    const mockData: User[] = [
      {
        id: 1,
        name: 'Test User',
        workouts: [{ type: 'Running', minutes: 30 }]
      }
    ];
    localStorage.setItem('workoutData', JSON.stringify(mockData));
    service['loadFromLocalStorage']();
    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockData);
    });
  });


// Update the test in workout.service.spec.ts
it('should handle JSON parse errors and initialize with default data', fakeAsync(() => {
  // 1. Set invalid JSON data
  localStorage.setItem('workoutData', '{invalid-json');
  
  // 2. Spy on console.error before triggering the error
  const consoleSpy = spyOn(console, 'error');
  
  // 3. Trigger the error-prone method
  service['loadFromLocalStorage']();
  
  // 4. Flush pending asynchronous operations
  tick();
  
  // 5. Verify results
  service.getUsers().subscribe(users => {
    const initialData = service['getInitialData']();
    expect(users).toEqual(initialData);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Error parsing localStorage data:', 
      jasmine.any(SyntaxError) // More specific check
    );
  });
  
  // 6. Ensure subscription completes
  tick();
}));



  it('should handle empty local storage', () => {
    localStorage.removeItem('workoutData');
    service['loadFromLocalStorage']();
    service.getUsers().subscribe(users => {
      const initialData = service['getInitialData']();
      expect(users).toEqual(initialData);
    });
  });

  it('should handle empty local storage', () => {
  localStorage.removeItem('workoutData');
  service['loadFromLocalStorage']();
  service.getUsers().subscribe(users => {
    const initialData = service['getInitialData']();
    expect(users).toEqual(initialData);
  });
});

  it('should save data to local storage', () => {
    const mockData: User[] = [
      {
        id: 1,
        name: 'Test User',
        workouts: [{ type: 'Running', minutes: 30 }]
      }
    ];
    service['saveToLocalStorage'](mockData);
    const storedData = localStorage.getItem('workoutData');
    expect(storedData).toEqual(JSON.stringify(mockData));
  });

  it('should add a workout to an existing user', () => {
    const initialData = service['getInitialData']();
    const userName = initialData[0].name;
    const newWorkout: Workout = { type: 'Cycling', minutes: 50 };

    service.addWorkout(userName, newWorkout);

    service.getUsers().subscribe(users => {
      const user = users.find(u => u.name === userName);
      expect(user?.workouts).toContain(newWorkout);
    });
  });

  // Enhance existing "should add a workout to a new user" test
it('should add a workout to a new user with correct ID', () => {
  const newUserName = 'New User';
  const newWorkout: Workout = { type: 'Swimming', minutes: 20 };

  service.addWorkout(newUserName, newWorkout);

  service.getUsers().subscribe(users => {
    // Verify user creation
    const user = users.find(u => u.name === newUserName);
    expect(user).toBeTruthy();
    expect(user?.id).toBe(users.length); // Verify ID generation
    expect(user?.workouts).toContain(newWorkout);
  });
});

// Add new test case
it('should reject workouts with zero or negative minutes', () => {
  const userName = 'Test User';
  const invalidWorkouts = [
    { type: 'Running', minutes: 0 },
    { type: 'Cycling', minutes: -10 },
    { type: 'Swimming' } as unknown as Workout // Test undefined minutes
  ];

  invalidWorkouts.forEach(workout => {
    service.addWorkout(userName, workout);
    service.getUsers().subscribe(users => {
      const user = users.find(u => u.name === userName);
      expect(user?.workouts).not.toContain(workout);
    });
  });
});

// Add to workout.service.spec.ts
it('should generate ID 1 when adding first user to empty list', () => {
  // Clear existing data
  service['usersSubject'].next([]);
  
  const newUserName = 'First User';
  const newWorkout: Workout = { type: 'Running', minutes: 30 };

  service.addWorkout(newUserName, newWorkout);

  service.getUsers().subscribe(users => {
    const user = users.find(u => u.name === newUserName);
    expect(user?.id).toBe(1); // Verify first ID
    expect(users.length).toBe(1);
  });
});

  it('should handle empty or invalid user name', () => {
    const emptyUserName = '';
    const newWorkout: Workout = { type: 'Running', minutes: 30 };

    service.addWorkout(emptyUserName, newWorkout);

    service.getUsers().subscribe(users => {
      const user = users.find(u => u.name === emptyUserName);
      expect(user).toBeUndefined();
    });
  });

  it('should handle invalid workout data', () => {
    const userName = 'Test User';
    const invalidWorkout = {} as Workout;

    service.addWorkout(userName, invalidWorkout);

    service.getUsers().subscribe(users => {
      const user = users.find(u => u.name === userName);
      expect(user?.workouts).not.toContain(invalidWorkout);
    });
  });

  it('should handle invalid workout minutes', () => {
    const userName = 'Test User';
    const invalidWorkout: Workout = { type: 'Running', minutes: 0 }; // <= 0 minutes
  
    service.addWorkout(userName, invalidWorkout);
  
    service.getUsers().subscribe(users => {
      const user = users.find(u => u.name === userName);
      expect(user?.workouts).not.toContain(invalidWorkout);
    });
  });

  it('should return the correct workout types', () => {
    const workoutTypes = service.getWorkoutTypes();
    expect(workoutTypes).toEqual(['Running', 'Cycling', 'Swimming', 'Yoga', 'Weight Training']);
  });

  it('should always return the correct workout types', () => {
    const workoutTypes = service.getWorkoutTypes();
    expect(workoutTypes).toEqual(['Running', 'Cycling', 'Swimming', 'Yoga', 'Weight Training']);

    workoutTypes.push('Invalid Type');
    expect(service.getWorkoutTypes()).not.toContain('Invalid Type');
  });
});