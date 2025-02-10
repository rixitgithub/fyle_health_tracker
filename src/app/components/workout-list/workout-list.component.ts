import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { WorkoutService } from '../../services/workout.service';
import { User } from '../../models/workout';

@Component({
  selector: 'app-workout-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule],
  templateUrl: './workout-list.component.html',
  styleUrls: ['./workout-list.component.css'],
})
export class WorkoutListComponent implements OnInit {
  displayedColumns = ['name', 'workouts', 'sessions', 'minutes'];
  allData: User[] = [];
  filteredData: User[] = [];
  pagedData: User[] = [];
  searchName = '';
  selectedType = '';
  workoutTypes: string[] = [];
  pageSize = 5;
  currentPage = 0;
  availablePageSizes = [5, 10, 20];

  constructor(private workoutService: WorkoutService) {
    this.workoutTypes = this.workoutService.getWorkoutTypes();
  }

  ngOnInit(): void {
    // Fetch users from the service
    this.workoutService.getUsers().subscribe((users) => {
      this.allData = users;
      this.applyFilters();
    });
  }

  // Filter the data based on the search name and selected type
  applyFilters(): void {
    const searchNameLower = this.searchName.toLowerCase();
    this.filteredData = this.allData.filter((user) => {
      const nameMatch = user.name.toLowerCase().includes(searchNameLower);
      const typeMatch =
        !this.selectedType ||
        user.workouts.some((workout) => workout.type === this.selectedType);
      return nameMatch && typeMatch;
    });

    if (this.selectedType) {
      this.filteredData = this.filteredData.map((user) => ({
        ...user,
        workouts: user.workouts.filter(
          (workout) => workout.type === this.selectedType
        ),
      }));
    }

    this.currentPage = 0;
    this.updatePagedData();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  // Get the total number of workouts sessions for a user
  getTotalSessions(user: User): number {
    return user.workouts.length;
  }

  // Get the total number of minutes for a user
  getTotalMinutes(user: User): number {
    return user.workouts.reduce((sum, workout) => sum + workout.minutes, 0);
  }

  // Clear the search name
  clearSearch(): void {
    this.searchName = '';
    this.applyFilters();
  }

  // Called when the page size changes
  onPageSizeChange(event: Event): void {
    const newSize = (event.target as HTMLSelectElement).value;
    this.pageSize = parseInt(newSize, 10);
    this.currentPage = 0;
    this.updatePagedData();
  }

  // Update the paged data based on the current page
  updatePagedData(): void {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize) || 1;
    this.currentPage = Math.min(Math.max(0, this.currentPage), totalPages - 1);

    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.pagedData = this.filteredData.slice(start, end);
  }

  // Navigate to the previous page
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePagedData();
    }
  }

  // Navigate to the next page
  nextPage(): void {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    if (this.currentPage < totalPages - 1) {
      this.currentPage++;
      this.updatePagedData();
    }
  }

  getPaginationText(): string {
    if (this.filteredData.length === 0) {
      return '0 of 0';
    }
    const start = this.currentPage * this.pageSize + 1;
    const end = Math.min(
      (this.currentPage + 1) * this.pageSize,
      this.filteredData.length
    );
    return `${start}-${end} of ${this.filteredData.length}`;
  }
}
