import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { WorkoutService } from '../../services/workout.service';

@Component({
  selector: 'app-workout-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './workout-form.component.html',
  styleUrls: ['./workout-form.component.css']
})
export class WorkoutFormComponent implements OnInit {
  name = '';
  workoutType = '';
  minutes = 30;
  workoutTypes: string[] = [];

  constructor(private workoutService: WorkoutService) { }

  ngOnInit() {
    // Get the workout types from the service
    this.workoutTypes = this.workoutService.getWorkoutTypes();
  }

  // Add a workout to the service
  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.workoutService.addWorkout(this.name, {
        type: this.workoutType,
        minutes: this.minutes
      });

      form.resetForm();
      this.name = '';
      this.workoutType = '';
      this.minutes = 30;
    }
  }
}
