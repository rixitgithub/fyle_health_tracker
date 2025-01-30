export interface Workout {
    type: string;
    minutes: number;
  }
  
  export interface User {
    id: number;
    name: string;
    workouts: Workout[];
  }
  
  export interface WorkoutSummary {
    name: string;
    totalMinutes: number;
    workoutTypes: string[];
  }