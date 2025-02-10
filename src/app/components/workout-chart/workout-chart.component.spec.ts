import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { WorkoutChartComponent } from './workout-chart.component';
import { WorkoutService } from '../../services/workout.service';
import { User } from '../../models/workout';
import { Subject } from 'rxjs';
import { Chart, TooltipItem, TooltipModel } from 'chart.js';
import { MatCardModule } from '@angular/material/card';

type ComponentPrivateMembers = {
  chart: Chart;
  pieChart: Chart<'pie'>;
  doughnutChart: Chart<'doughnut'>;
  prepareChartData: (users: User[]) => any;
  getWorkoutTimeDistribution: (user: User) => any;
  [key: string]: any;
};

describe('WorkoutChartComponent', () => {
  let component: WorkoutChartComponent;
  let fixture: ComponentFixture<WorkoutChartComponent>;
  let mockWorkoutService: Partial<WorkoutService>;
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'User1',
      workouts: [
        { type: 'Running', minutes: 30 },
        { type: 'Cycling', minutes: 45 },
      ],
    },
    {
      id: 2,
      name: 'User2',
      workouts: [
        { type: 'Swimming', minutes: 60 },
        { type: 'Yoga', minutes: 20 },
      ],
    },
  ];
  let usersSubject: Subject<User[]>;

  beforeEach(async () => {
    usersSubject = new Subject<User[]>();
    mockWorkoutService = {
      getUsers: () => usersSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [WorkoutChartComponent, MatCardModule],
      providers: [{ provide: WorkoutService, useValue: mockWorkoutService }],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutChartComponent);
    component = fixture.componentInstance as unknown as WorkoutChartComponent &
      ComponentPrivateMembers;
    fixture.detectChanges();
  });

  beforeEach(() => {
    const store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake(
      (key: string) => store[key] || '[]'
    );
    spyOn(localStorage, 'setItem').and.callFake(
      (key: string, value: string) => {
        store[key] = value;
      }
    );
  });

  afterEach(() => {
    if (component) {
      component.ngOnDestroy();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and subscribe to users', fakeAsync(() => {
    usersSubject.next(mockUsers);
    tick();

    expect(component.users).toEqual(mockUsers);
    expect(component.selectedUser).toBe(mockUsers[0]);
  }));

  it('should create charts on data update', fakeAsync(() => {
    spyOn(component, 'updateCharts').and.callThrough();
    spyOn(Chart.prototype, 'destroy').and.callThrough();

    usersSubject.next(mockUsers);
    tick();

    expect(component.updateCharts).toHaveBeenCalledWith(mockUsers);
    expect(
      (component as unknown as ComponentPrivateMembers).chart
    ).toBeDefined();
    expect(
      (component as unknown as ComponentPrivateMembers).pieChart
    ).toBeDefined();
    expect(
      (component as unknown as ComponentPrivateMembers).doughnutChart
    ).toBeDefined();
  }));

  it('should prepare chart data correctly', () => {
    const result = (
      component as unknown as ComponentPrivateMembers
    ).prepareChartData(mockUsers);
    expect(result.labels).toEqual(['User1', 'User2']);
    expect(result.datasets.length).toBe(5);
    expect(result.datasets[0].label).toBe('Running');
    expect(result.datasets[0].data).toEqual([30, 0]);
  });

  it('should calculate workout distribution', () => {
    const result = component.getWorkoutDistribution(mockUsers);

    expect(result.labels).toEqual([
      'Running',
      'Swimming',
      'Cycling',
      'Yoga',
      'Weight Training',
    ]);
    expect(result.data).toEqual([30, 60, 45, 20, 0]);
    expect(result.colors.length).toBe(5);
  });

  it('should get user workout time distribution', () => {
    const result = (
      component as unknown as ComponentPrivateMembers
    ).getWorkoutTimeDistribution(mockUsers[0]);
    expect(result.labels).toEqual([
      'Running',
      'Swimming',
      'Cycling',
      'Yoga',
      'Weight Training',
    ]);
    expect(result.data).toEqual([30, 0, 45, 0, 0]);
  });

  it('should return correct colors for workout types', () => {
    expect(component.getColorForWorkoutType('Running')).toBe('#c4b484');
    expect(component.getColorForWorkoutType('Swimming')).toBe('#a3c4bc');
    expect(component.getColorForWorkoutType('Unknown')).toBe('#333333');
  });

  it('should handle responsive font sizes', () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(500);
    expect(component.getResponsiveFontSize()).toBe(10);
    jasmine.getEnv().allowRespy(true);
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(800);
    expect(component.getResponsiveFontSize()).toBe(12);
    jasmine.getEnv().allowRespy(true);
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1400);
    expect(component.getResponsiveFontSize()).toBe(14);
  });

  it('should handle default font size for large screens', () => {
    spyOnProperty(window, 'innerWidth', 'get').and.returnValue(2000);
    expect(component.getResponsiveFontSize()).toBe(14);
  });

  it('should format tooltip labels correctly', fakeAsync(() => {
    usersSubject.next(mockUsers);
    tick();
    fixture.detectChanges();
    const privateComponent = component as unknown as ComponentPrivateMembers;
    const pieTooltipCallback =
      privateComponent.pieChart?.options?.plugins?.tooltip?.callbacks?.label;
    const pieTooltipItem = {
      label: 'Running',
      raw: 30,
      dataset: { label: 'Workout Distribution' },
    } as unknown as TooltipItem<'pie'>;

    const pieContext = {
      chart: privateComponent.pieChart,
      tooltip: {} as TooltipModel<'pie'>,
    } as unknown as TooltipModel<'pie'>;

    expect(pieTooltipCallback?.call(pieContext, pieTooltipItem)).toBe(
      'Running: 30 minutes'
    );

    const doughnutTooltipCallback =
      privateComponent.doughnutChart?.options?.plugins?.tooltip?.callbacks
        ?.label;
    const doughnutTooltipItem = {
      label: 'Cycling',
      raw: 45,
      dataset: { label: 'Time Distribution' },
    } as unknown as TooltipItem<'doughnut'>;

    const doughnutContext = {
      chart: privateComponent.doughnutChart,
      tooltip: {} as TooltipModel<'doughnut'>,
    } as unknown as TooltipModel<'doughnut'>;

    expect(
      doughnutTooltipCallback?.call(doughnutContext, doughnutTooltipItem)
    ).toBe('Cycling: 45 minutes');
  }));

  it('should handle user selection change', () => {
    spyOn(component, 'updateCharts');
    component.users = mockUsers;

    const mockEvent = { target: { value: 'User2' } } as unknown as Event;
    component.onUserChange(mockEvent);

    expect(component.selectedUser).toBe(mockUsers[1]);
    expect(component.updateCharts).toHaveBeenCalledWith(mockUsers);
  });

  it('should handle window resize', fakeAsync(() => {
    usersSubject.next(mockUsers);
    tick();

    spyOn(component, 'updateCharts');
    window.dispatchEvent(new Event('resize'));

    expect(component.updateCharts).toHaveBeenCalledWith(mockUsers);
  }));

  it('should clean up on destroy', () => {
    spyOn(Chart.prototype, 'destroy').and.callThrough();
    component.ngOnDestroy();

    expect(
      (component as unknown as ComponentPrivateMembers).chart
    ).toBeUndefined();
    expect(
      (component as unknown as ComponentPrivateMembers).pieChart
    ).toBeUndefined();
    expect(
      (component as unknown as ComponentPrivateMembers).doughnutChart
    ).toBeUndefined();
  });

  it('should handle empty user data', fakeAsync(() => {
    usersSubject.next([]);
    tick();

    expect(component.users).toEqual([]);
    expect(component.selectedUser).toBeUndefined();
  }));

  it('should update doughnut chart when user changes', fakeAsync(() => {
    usersSubject.next(mockUsers);
    tick();

    const initialDoughnut = (component as unknown as ComponentPrivateMembers)
      .doughnutChart;
    component.selectedUser = mockUsers[1];
    component.updateCharts(mockUsers);

    expect(initialDoughnut).toBeDefined();
    expect(
      (component as unknown as ComponentPrivateMembers).doughnutChart
    ).toBeDefined();
  }));
});
