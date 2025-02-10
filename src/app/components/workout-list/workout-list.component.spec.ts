import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutListComponent } from './workout-list.component';
import { WorkoutService } from '../../services/workout.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User, Workout } from '../../models/workout';

describe('WorkoutListComponent', () => {
  let component: WorkoutListComponent;
  let fixture: ComponentFixture<WorkoutListComponent>;
  let service: WorkoutService;
  let localStorageMock: {
    getItem: jasmine.Spy;
    setItem: jasmine.Spy;
    clear: jasmine.Spy;
    [key: string]: any;
  };

  const expectedInitialData: User[] = [
    {
      id: 1,
      name: 'Rishit Tiwari',
      workouts: [
        { type: 'Running', minutes: 40 },
        { type: 'Cycling', minutes: 45 },
        { type: 'Swimming', minutes: 20 },
        { type: 'Yoga', minutes: 25 },
        { type: 'Weight Training', minutes: 20 }
      ]
    },
    {
      id: 2,
      name: 'Rudraksh Tiwari',
      workouts: [
        { type: 'Running', minutes: 40 },
        { type: 'Weight Training', minutes: 10 }
      ]
    },
    {
      id: 3,
      name: 'Ritesh Kumar',
      workouts: [
        { type: 'Swimming', minutes: 40 }
      ]
    },
    {
      id: 4,
      name: 'Rachna',
      workouts: [
        { type: 'Yoga', minutes: 50 }
      ]
    }
  ];

  beforeEach(async () => {
    localStorageMock = {
      getItem: jasmine.createSpy('getItem'),
      setItem: jasmine.createSpy('setItem'),
      clear: jasmine.createSpy('clear'),
    };

    spyOn(localStorage, 'getItem').and.callFake(localStorageMock.getItem);
    spyOn(localStorage, 'setItem').and.callFake(localStorageMock.setItem);
    spyOn(localStorage, 'clear').and.callFake(localStorageMock.clear);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        WorkoutListComponent
      ],
      providers: [WorkoutService]
    }).compileComponents();
  });

  const recreateComponent = () => {
    fixture = TestBed.createComponent(WorkoutListComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(WorkoutService);
    fixture.detectChanges();
  };

  beforeEach(() => {
    localStorageMock.getItem.calls.reset();
    localStorageMock.setItem.calls.reset();
    localStorageMock.clear.calls.reset();
    localStorageMock.getItem.and.returnValue(null);
    recreateComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load initial data when localStorage is empty', () => {
    expect(component.allData).toEqual(expectedInitialData);
  });

  it('should load data from localStorage when available', () => {
    const mockUsers: User[] = [{ id: 1, name: 'Test User', workouts: [] }];
    localStorageMock.getItem.and.returnValue(JSON.stringify(mockUsers));
    TestBed.resetTestingModule();
    recreateComponent();
    expect(component.allData).toEqual(mockUsers);
  });

  it('should handle invalid localStorage data and load initial data', () => {
    const consoleSpy = spyOn(console, 'error');
    localStorageMock.getItem.and.returnValue('invalid JSON');
    TestBed.resetTestingModule();
    recreateComponent();

    expect(component.allData).toEqual(expectedInitialData);
    expect(consoleSpy).toHaveBeenCalledWith('Error parsing localStorage data:', jasmine.any(Error));
  });

  it('should add new user through service', () => {
    const initialLength = component.allData.length;
    service.addWorkout('New User', { type: 'Running', minutes: 30 });
    fixture.detectChanges();

    expect(component.allData.length).toBe(initialLength + 1);
    expect(component.allData.some(u => u.name === 'New User')).toBeTrue();
  });

  it('should add workout to existing user through service', () => {
    const user = component.allData.find(u => u.name === 'Rishit Tiwari')!;
    const initialWorkouts = user.workouts.length;

    service.addWorkout('Rishit Tiwari', { type: 'Cycling', minutes: 60 });
    fixture.detectChanges();

    expect(user.workouts.length).toBe(initialWorkouts + 1);
  });

  it('should save to localStorage when adding workout', () => {
    service.addWorkout('Test User', { type: 'Yoga', minutes: 30 });

    const [key, value] = localStorageMock.setItem.calls.argsFor(0);
    const storedData: User[] = JSON.parse(value);

    expect(key).toBe('workoutData');
    expect(storedData).toEqual(jasmine.arrayContaining([
      jasmine.objectContaining({ name: 'Test User' })
    ]));
  });

  it('should filter users by name', () => {
    component.searchName = 'Rishit';
    component.applyFilters();

    expect(component.filteredData.length).toBe(1);
    expect(component.filteredData[0].name).toBe('Rishit Tiwari');
  });

  it('should filter workouts by type', () => {
    component.selectedType = 'Yoga';
    component.applyFilters();

    const filtered = component.filteredData.every(user =>
      user.workouts.every(w => w.type === 'Yoga')
    );
    expect(filtered).toBeTrue();
  });

  it('should clear search input', () => {
    component.searchName = 'Test';
    component.clearSearch();

    expect(component.searchName).toBe('');
    expect(component.filteredData).toEqual(expectedInitialData);
  });

  it('should calculate total sessions correctly', () => {
    const user = expectedInitialData[0];
    expect(component.getTotalSessions(user)).toBe(user.workouts.length);
  });

  it('should calculate total minutes correctly', () => {
    const user = expectedInitialData[0];
    const total = user.workouts.reduce((sum, w) => sum + w.minutes, 0);
    expect(component.getTotalMinutes(user)).toBe(total);
  });

  it('should handle pagination navigation', () => {
    component.pageSize = 2;
    component.currentPage = 1;
    component.applyFilters();

    component.nextPage();
    expect(component.currentPage).toBe(1);

    component.previousPage();
    expect(component.currentPage).toBe(0);
  });

  it('should display correct pagination text', () => {
    component.pageSize = 3;
    component.applyFilters();
    expect(component.getPaginationText()).toBe(`1-3 of ${expectedInitialData.length}`);
  });

  it('should show empty state when no matches found', () => {
    component.searchName = 'NonExistentUser';
    component.applyFilters();
    fixture.detectChanges();

    const emptyMessage = fixture.nativeElement.querySelector('.flex');
    expect(emptyMessage).toBeTruthy();
  });

  it('should generate new user IDs correctly', () => {
    localStorageMock.getItem.and.returnValue(JSON.stringify([]));
    TestBed.resetTestingModule();
    recreateComponent();
    service.addWorkout('New User', { type: 'Running', minutes: 30 });
    const newUser = service['usersSubject'].value.find(u => u.name === 'New User');
    expect(newUser?.id).toBe(1);
  });

  it('should handle workout type colors correctly', () => {
    component.filteredData = [{
      id: 1,
      name: 'Test User',
      workouts: [{ type: 'Running', minutes: 30 }]
    }];
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.bg-\\[\\#c4b484\\]');
    expect(badge).toBeTruthy();
  });

  it('should reject invalid workout entries', () => {
    const initialLength = component.allData.length;

    service.addWorkout('', { type: 'Running', minutes: 30 });
    service.addWorkout('Test', { type: '', minutes: 30 });
    service.addWorkout('Test', { type: 'Running', minutes: -5 });

    expect(component.allData.length).toBe(initialLength);
  });

  it('should handle null localStorage value correctly', () => {
    localStorageMock.getItem.and.returnValue(null);

    fixture = TestBed.createComponent(WorkoutListComponent);
    service = TestBed.inject(WorkoutService);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(service['usersSubject'].value).toEqual(expectedInitialData);
  });

  it('should maintain existing user IDs when adding new users', () => {
    const initialUsers = [...expectedInitialData];
    service.addWorkout('New User', { type: 'Cycling', minutes: 45 });

    const newUser = service['usersSubject'].value.find(u => u.name === 'New User');
    expect(newUser?.id).toBe(5);
    expect(service['usersSubject'].value.slice(0, 4)).toEqual(initialUsers);
  });

  it('should handle duplicate user names correctly', () => {
    service.addWorkout('Rishit Tiwari', { type: 'Swimming', minutes: 30 });
    const user = component.allData.find(u => u.name === 'Rishit Tiwari')!;

    expect(user.workouts.length).toBe(6);
    expect(user.id).toBe(1);
  });

  it('should handle empty workout type filter', () => {
    component.selectedType = '';
    component.applyFilters();

    expect(component.filteredData).toEqual(expectedInitialData);
  });

  it('should handle nextPage navigation', () => {
    component.pageSize = 2;
    component.filteredData = new Array(3).fill({}); // Create 3 items
    component.nextPage();
    expect(component.currentPage).toBe(1);
  });

  it('should not go beyond data length in nextPage', () => {
    component.pageSize = 5;
    component.filteredData = new Array(5).fill({});
    component.nextPage();
    expect(component.currentPage).toBe(0);
  });


  it('should calculate total pages correctly', () => {
    // Test various scenarios
    component.filteredData = new Array(15).fill({} as User);
    component.pageSize = 5;
    expect(component.totalPages).toBe(3);

    component.filteredData = new Array(0).fill({} as User);
    expect(component.totalPages).toBe(0);

    component.filteredData = new Array(7).fill({} as User);
    component.pageSize = 3;
    expect(component.totalPages).toBe(3);
  });

});
