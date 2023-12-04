import { Component, OnInit } from '@angular/core';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Olympic } from 'src/app/core/models/Olympic';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent implements OnInit {
  public olympic: Olympic | undefined;

  data: any;
  options: any;

  countryName: string | undefined;
  numberOfEntries: number | undefined;
  totalNumberMedals: number | undefined;
  totalNumberAthletes: number | undefined;

  constructor(
    private olympicService: OlympicService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (!navigator.onLine) {
      this.router.navigate(['/error']);
      return;
    }
    this.route.params.subscribe((params) => {
      const country = params['country'];

      if (!country) {
        this.router.navigate(['/error']);
        return;
      }

      this.olympic = this.olympicService.getOlympicByCountry(country);

      if (!this.olympic) {
        this.router.navigate(['/error']);
        return;
      }

      this.countryName = this.olympic.country;
      this.numberOfEntries = this.olympic.participations.length;
      this.totalNumberMedals = this.calculateTotalMedals();
      this.totalNumberAthletes = this.calculateTotalAthletes();

      this.updateChartData();
    });
  }

  private updateChartData() {
    if (this.olympic) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');

      this.data = {
        labels: this.olympic.participations.map((participation) =>
          participation.year.toString()
        ),
        datasets: [
          {
            label: 'Medals Count',
            data: this.olympic.participations.map(
              (participation) => participation.medalsCount
            ),
            backgroundColor: [
              documentStyle.getPropertyValue('--pink-900'),
              documentStyle.getPropertyValue('--blue-300'),
              documentStyle.getPropertyValue('--indigo-400'),
            ],
            borderColor: [
              documentStyle.getPropertyValue('--pink-900'),
              documentStyle.getPropertyValue('--blue-300'),
              documentStyle.getPropertyValue('--indigo-400'),
            ],
            borderWidth: 1,
          },
        ],
      };

      this.options = {
        maintainAspectRatio: false,
        aspectRatio: 1.5,
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
      };
    }
  }

  private calculateTotalMedals(): number {
    return (
      this.olympic?.participations.reduce(
        (total, p) => total + p.medalsCount,
        0
      ) || 0
    );
  }

  private calculateTotalAthletes(): number {
    return (
      this.olympic?.participations.reduce(
        (total, p) => total + p.athleteCount,
        0
      ) || 0
    );
  }

  navigateBack() {
    this.router.navigate(['./']);
  }
}
