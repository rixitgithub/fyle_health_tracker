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
  minutes = 0;
  workoutTypes: string[] = [];

  constructor(private workoutService: WorkoutService) { }

  ngOnInit() {
    this.workoutTypes = this.workoutService.getWorkoutTypes();
    console.log('Available workout types:', this.workoutTypes);
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.workoutService.addWorkout(this.name, {
        type: this.workoutType,
        minutes: this.minutes
      });

      // Reset form and model values properly
      form.resetForm();
      this.name = '';
      this.workoutType = '';
      this.minutes = 0;
    }
  }
}