import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkoutFormComponent } from './components/workout-form/workout-form.component';
import { WorkoutListComponent } from './components/workout-list/workout-list.component';
import { WorkoutChartComponent } from './components/workout-chart/workout-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    WorkoutFormComponent,
    WorkoutListComponent,
    WorkoutChartComponent
  ],
  template: `
    <div class="min-h-screen">
<nav class="w-full">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
    <!-- Left side image -->
    <img src="https://img.notionusercontent.com/s3/prod-files-secure%2F983632c5-ee66-4f64-a1a6-b3eeff04ddb8%2F55f4207f-d3c8-4afd-8ee9-b26f45484ecf%2Ffyle_login_logo.png/size/w=250?exp=1738274570&sig=VkLjKsmtDov_IuK53lK_vSuu-qx3aJpYR70LjTuRUTs" 
         alt="Logo" 
         class="h-20 w-auto">

    <!-- Right side text with spacing -->
    <div class="ml-4 flex flex-col justify-center text-white">
      <p class="text-6xl teko-add font-bold">Fyle Frontend Challenge</p>
      <p class="text-m text-gray-100 text-center nanum-pen-script-regular">~ Rishit Tiwari</p>
    </div>
  </div>
</nav>



  <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Sidebar with Form -->
      <div class="lg:col-span-4">
        <div class="sticky top-8">
          <app-workout-form></app-workout-form>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-8 space-y-8">
        <div class="space-y-8">
          <app-workout-list></app-workout-list>
        </div>
        <div class="mt-8">
          <app-workout-chart></app-workout-chart>
        </div>
      </div>
    </div>
  </main>
  <footer class="text-center text-white text-sm py-4">
  Built by Rishit Tiwari ❤️
</footer>

</div>

  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent {
  title = 'Hello, fyle-healthtracker';
}