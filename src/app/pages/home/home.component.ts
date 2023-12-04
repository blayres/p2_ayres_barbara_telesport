import { Component, OnInit } from '@angular/core';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from 'src/app/core/models/Olympic';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public olympics: Olympic[] = [];
  public numberOfJOs: number = 0;
  public numberOfCountries: number = 0;

  constructor(private olympicService: OlympicService, private router: Router) {}

  data: any;
  options: any;

  ngOnInit() {
    if (!navigator.onLine) {
      this.router.navigate(['/error']);
      return;
    }
    this.olympicService.loadInitialData().subscribe(() => {
      this.olympicService.getOlympics().subscribe((olympics) => {
        this.olympics = olympics;
        this.updateChartData();

        this.numberOfJOs = this.calculateTotalJOs();
        this.numberOfCountries = this.calculateTotalCountries();
      });
    });
  }

  private updateChartData() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.data = {
      labels: this.olympics.map((olympic) => olympic.country),
      datasets: [
        {
          data: this.olympics.map((olympic) =>
            olympic.participations.reduce(
              (total, p) => total + p.medalsCount,
              0
            )
          ),
          backgroundColor: [
            documentStyle.getPropertyValue('--pink-900'),
            documentStyle.getPropertyValue('--blue-300'),
            documentStyle.getPropertyValue('--indigo-400'),
            documentStyle.getPropertyValue('--cyan-100'),
            documentStyle.getPropertyValue('--blue-100'),
            documentStyle.getPropertyValue('--orange-800'),
          ],
          borderColor: [
            documentStyle.getPropertyValue('--pink-900'),
            documentStyle.getPropertyValue('--blue-300'),
            documentStyle.getPropertyValue('--indigo-400'),
            documentStyle.getPropertyValue('--cyan-100'),
            documentStyle.getPropertyValue('--blue-100'),
            documentStyle.getPropertyValue('--orange-800'),
          ],
        },
      ],
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
          padding: {
            top: 10,
          },
        },
      },
      onClick: (event: any, elements: any) => {
        if (elements && elements.length > 0) {
          const clickedIndex = elements[0].index;
          const country = this.olympics[clickedIndex].country;
          this.navigateToDetails(country);
        }
      },
    };
  }

  private calculateTotalJOs(): number {
    const uniqueYears = new Set<number>();

    this.olympics.forEach((olympic) => {
      olympic.participations.forEach((participation) => {
        uniqueYears.add(participation.year);
      });
    });

    return uniqueYears.size;
  }

  private calculateTotalCountries(): number {
    const uniqueCountries = new Set<string>();

    this.olympics.forEach((olympic) => {
      uniqueCountries.add(olympic.country);
    });

    return uniqueCountries.size;
  }

  private navigateToDetails(country: string) {
    this.router.navigate(['./details', country]);
  }
}
