import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Chart, registerables } from 'chart.js';
import { WorkoutService } from '../../services/workout.service';
import { User } from '../../models/workout';
import { Subscription } from 'rxjs';
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-workout-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './workout-chart.component.html',
  styleUrls: ['./workout-chart.component.css'],
})
export class WorkoutChartComponent implements OnInit, OnDestroy {
  private chart: Chart | undefined;
  private pieChart: Chart | undefined;
  private doughnutChart: Chart | undefined;
  private subscription: Subscription | undefined;
  users: User[] = [];
  selectedUser: User | undefined;

  constructor(private workoutService: WorkoutService) {}

  ngOnInit(): void {
    this.subscription = this.workoutService.getUsers().subscribe((users) => {
      this.users = users;
      this.selectedUser = users[0];
      this.updateCharts(users);
    });
  }

  updateCharts(users: User[]): void {
    const data = this.prepareChartData(users);

    if (this.chart) {
      this.chart.destroy();
    }
    // Bar Chart
    this.chart = new Chart('workoutChart', {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: data.datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top' as const,
            labels: {
              font: {
                family: "'Inter', sans-serif",
                size: this.getResponsiveFontSize(),
              },
            },
          },
          title: {
            display: false,
          },
          datalabels: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: this.getResponsiveFontSize(),
              },
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                family: "'Inter', sans-serif",
                size: this.getResponsiveFontSize(),
              },
            },
          },
        },
      },
    });

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    // Pie Chart (Overall Workout Distribution)
    const workoutDistribution = this.getWorkoutDistribution(users);
    this.pieChart = new Chart('pieChart', {
      type: 'pie',
      data: {
        labels: workoutDistribution.labels,
        datasets: [
          {
            data: workoutDistribution.data,
            backgroundColor: workoutDistribution.colors,
            borderColor: '#000000',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              font: {
                family: "'Inter', sans-serif",
                size: this.getResponsiveFontSize(),
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                return `${tooltipItem.label}: ${tooltipItem.raw} minutes`;
              },
            },
          },
          datalabels: {
            formatter: (value, context) => {
              const percentage =
                (value / workoutDistribution.data.reduce((a, b) => a + b, 0)) *
                100;
              return percentage > 0 ? `${percentage.toFixed(1)}%` : '';
            },
            color: '#000000',
            font: {
              weight: 'bold',
              size: this.getResponsiveFontSize(),
            },
          },
        },
      },
    });

    if (this.doughnutChart) {
      this.doughnutChart.destroy();
    }

    // Doughnut Chart (Individual User Workout Time Distribution)
    if (this.selectedUser) {
      const workoutTimeDistribution = this.getWorkoutTimeDistribution(
        this.selectedUser
      );
      this.doughnutChart = new Chart('doughnutChart', {
        type: 'doughnut',
        data: {
          labels: workoutTimeDistribution.labels,
          datasets: [
            {
              data: workoutTimeDistribution.data,
              backgroundColor: workoutTimeDistribution.colors,
              borderColor: '#000000',
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                font: {
                  family: "'Inter', sans-serif",
                  size: this.getResponsiveFontSize(),
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => {
                  return `${tooltipItem.label}: ${tooltipItem.raw} minutes`;
                },
              },
            },
            datalabels: {
              formatter: (value, context) => {
                const percentage =
                  (value /
                    workoutTimeDistribution.data.reduce((a, b) => a + b, 0)) *
                  100;
                return percentage > 0 ? `${percentage.toFixed(1)}%` : '';
              },
              color: '#000000',
              font: {
                weight: 'bold',
                size: this.getResponsiveFontSize(),
              },
            },
          },
        },
      });
    }
  }

  private prepareChartData(users: User[]): {
    labels: string[];
    datasets: any[];
  } {
    const workoutTypes = [
      'Running',
      'Swimming',
      'Cycling',
      'Yoga',
      'Weight Training',
    ];
    const userData = users.map((user) => ({
      name: user.name,
      workouts: user.workouts,
    }));

    const datasets = workoutTypes.map((type) => ({
      label: type,
      data: userData.map((user) => {
        const workout = user.workouts.find((w) => w.type === type);
        return workout ? workout.minutes : 0;
      }),
      backgroundColor: userData.map((user) =>
        this.getColorForWorkoutType(type)
      ),
      borderColor: '#000000',
      borderWidth: 2,
    }));

    return {
      labels: userData.map((user) => user.name),
      datasets,
    };
  }

  getWorkoutDistribution(users: User[]): {
    labels: string[];
    data: number[];
    colors: string[];
  } {
    const workoutTypes = [
      'Running',
      'Swimming',
      'Cycling',
      'Yoga',
      'Weight Training',
    ];
    const workoutMinutes = workoutTypes.map((type) =>
      users.reduce((sum, user) => {
        const workout = user.workouts.find((w) => w.type === type);
        return sum + (workout ? workout.minutes : 0);
      }, 0)
    );

    return {
      labels: workoutTypes,
      data: workoutMinutes,
      colors: workoutTypes.map((type) => this.getColorForWorkoutType(type)),
    };
  }

  private getWorkoutTimeDistribution(user: User): {
    labels: string[];
    data: number[];
    colors: string[];
  } {
    const workoutTypes = [
      'Running',
      'Swimming',
      'Cycling',
      'Yoga',
      'Weight Training',
    ];
    const workoutMinutes = workoutTypes.map((type) => {
      const workout = user.workouts.find((w) => w.type === type);
      return workout ? workout.minutes : 0;
    });

    return {
      labels: workoutTypes,
      data: workoutMinutes,
      colors: workoutTypes.map((type) => this.getColorForWorkoutType(type)),
    };
  }

  getColorForWorkoutType(type: string): string {
    switch (type) {
      case 'Running':
        return '#c4b484';
      case 'Swimming':
        return '#a3c4bc';
      case 'Cycling':
        return '#b0a3c4';
      case 'Yoga':
        return '#c4a3a3';
      case 'Weight Training':
        return '#a3c4a3';
      default:
        return '#333333';
    }
  }

  getResponsiveFontSize(): number {
    const screenWidth = window.innerWidth;
    if (screenWidth < 600) {
      return 10;
    } else if (screenWidth < 1200) {
      return 12;
    } else {
      return 14;
    }
  }

  // Handles user selection change
  onUserChange(event: any): void {
    const userName = event.target.value;
    this.selectedUser = this.users.find((user) => user.name === userName);
    this.updateCharts(this.users);
  }

  // Handles window resize to adjust chart size dynamically
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.doughnutChart) {
      this.doughnutChart.destroy();
    }
    this.updateCharts(this.users);
  }

  // Cleanups subscriptions and destroy charts on component destroy
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.doughnutChart) {
      this.doughnutChart.destroy();
    }
  }
}
