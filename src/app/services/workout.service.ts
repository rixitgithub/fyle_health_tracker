import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, Workout } from '../models/workout';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private readonly STORAGE_KEY = 'workoutData';
  private usersSubject = new BehaviorSubject<User[]>(this.getInitialData());

  constructor() {
    this.loadFromLocalStorage();
  }

  private getInitialData(): User[] {
    return [
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
  }

  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.usersSubject.next(JSON.parse(data));
      } else {
        this.usersSubject.next(this.getInitialData());
      }
    } catch (e) {
      console.error('Error parsing localStorage data:', e);
      this.usersSubject.next(this.getInitialData());
    }
  }

  private saveToLocalStorage(users: User[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  // Sends workout types to form and filter by type dropdown
  getWorkoutTypes(): string[] {
    return ['Running', 'Cycling', 'Swimming', 'Yoga', 'Weight Training'];
  }
  // Adds a workout to the user's workout list
  addWorkout(userName: string, workout: Workout): void {
    if (
      !userName.trim() ||
      !workout.type ||
      !workout.minutes ||
      workout.minutes <= 0
    ) {
      return;
    }

    const users = this.usersSubject.value;

    const nextId = users.length > 0
      ? Math.max(...users.map(u => u.id)) + 1
      : 1;

    let user = users.find(u => u.name === userName);

    if (!user) {
      user = { id: nextId, name: userName, workouts: [] };
      users.push(user);
    }

    user.workouts.push({ ...workout });
    this.usersSubject.next([...users]);
    this.saveToLocalStorage(this.usersSubject.value);
  }
  // Returns the list of users
  getUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }
}
