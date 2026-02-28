import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Button,
  FeatureCard,
  SectionHeader,
  Input,
  Stat,
  Navbar,
  Footer,
  DataTable,
  BarChart,
  type TableColumn,
} from '../shared/components';
import { transformToRadialDataset, isRadialChartType } from '../shared/utils';
import { ThemeService } from '../../core/services';
import { CalendarioComponent } from '../calendario/calendario.component';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  team: string;
  deadline: string;
}

@Component({
  selector: 'app-landing',
  imports: [
    CommonModule,
    Button,
    FeatureCard,
    SectionHeader,
    Input,
    Stat,
    Navbar,
    Footer,
    DataTable,
    BarChart,
    CalendarioComponent,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  // Services
  private themeService = inject(ThemeService);

  // Theme-aware computed
  protected readonly isDarkMode = computed(() => this.themeService.currentConfig().mode === 'dark');

  // Signals
  protected readonly email = signal('');

  // Table columns configuration
  protected readonly projectColumns = signal<TableColumn[]>([
    { field: 'name', header: 'Project', sortable: true, template: 'text' },
    { field: 'status', header: 'Status', sortable: true, template: 'badge' },
    { field: 'progress', header: 'Progress', sortable: true, template: 'progress' },
    { field: 'team', header: 'Team', sortable: true, template: 'text' },
    { field: 'deadline', header: 'Deadline', sortable: true, template: 'text' },
  ]);

  // Chart interactivity signals
  protected readonly currentChartType = signal<
    'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter'
  >('bar');
  protected readonly currentDataset = signal<'projects' | 'hours' | 'team'>('projects');
  protected readonly selectedDataPoint = signal<string | null>(null);

  // Projects data (mock)
  protected readonly projects = signal<Project[]>([
    {
      id: 1,
      name: 'Agent Landing Page',
      status: 'Completed',
      progress: 100,
      team: 'Frontend Team',
      deadline: '2026-01-15',
    },
    {
      id: 2,
      name: 'AI Chat Integration',
      status: 'In Progress',
      progress: 65,
      team: 'AI Team',
      deadline: '2026-03-20',
    },
    {
      id: 3,
      name: 'Admin Dashboard',
      status: 'In Progress',
      progress: 45,
      team: 'Backend Team',
      deadline: '2026-04-10',
    },
    {
      id: 4,
      name: 'Mobile App',
      status: 'Planning',
      progress: 10,
      team: 'Mobile Team',
      deadline: '2026-06-30',
    },
    {
      id: 5,
      name: 'API Gateway',
      status: 'Completed',
      progress: 100,
      team: 'Backend Team',
      deadline: '2026-01-30',
    },
    {
      id: 6,
      name: 'Payment System',
      status: 'In Progress',
      progress: 80,
      team: 'Integration Team',
      deadline: '2026-02-28',
    },
  ]);

  // Chart datasets (mock)
  private readonly projectsDataset = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Completed Projects',
        data: [3, 5, 4, 6, 7, 5],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'In Progress',
        data: [2, 3, 5, 4, 3, 4],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Planning',
        data: [1, 2, 1, 2, 1, 2],
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  private readonly hoursDataset = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Development Hours',
        data: [320, 450, 380, 520, 610, 480],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        borderRadius: 8,
        tension: 0.4,
      },
      {
        label: 'Design Hours',
        data: [120, 150, 180, 160, 140, 170],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2,
        borderRadius: 8,
        tension: 0.4,
      },
      {
        label: 'Testing Hours',
        data: [80, 95, 110, 105, 90, 100],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
        borderRadius: 8,
        tension: 0.4,
      },
    ],
  };

  private readonly teamDataset = {
    labels: ['Frontend', 'Backend', 'AI Team', 'Mobile', 'Integration', 'DevOps'],
    datasets: [
      {
        label: 'Team Members',
        data: [8, 12, 6, 5, 7, 4],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  private readonly bubbleDataset = {
    datasets: [
      {
        label: 'Team A Performance',
        data: [
          { x: 20, y: 30, r: 15 },
          { x: 40, y: 10, r: 10 },
          { x: 15, y: 25, r: 25 },
          { x: 35, y: 40, r: 20 },
          { x: 25, y: 20, r: 12 },
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Team B Performance',
        data: [
          { x: 30, y: 35, r: 18 },
          { x: 10, y: 15, r: 8 },
          { x: 45, y: 30, r: 22 },
          { x: 20, y: 45, r: 14 },
          { x: 50, y: 25, r: 16 },
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
    ],
  };

  private readonly scatterDataset = {
    datasets: [
      {
        label: 'Development Time vs Quality',
        data: [
          { x: 10, y: 85 },
          { x: 15, y: 90 },
          { x: 20, y: 78 },
          { x: 25, y: 92 },
          { x: 30, y: 88 },
          { x: 35, y: 95 },
          { x: 40, y: 82 },
          { x: 45, y: 91 },
          { x: 50, y: 87 },
          { x: 55, y: 93 },
        ],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        pointRadius: 8,
        pointHoverRadius: 12,
      },
      {
        label: 'Bug Fixes vs Satisfaction',
        data: [
          { x: 5, y: 70 },
          { x: 12, y: 75 },
          { x: 18, y: 82 },
          { x: 22, y: 88 },
          { x: 28, y: 85 },
          { x: 32, y: 90 },
          { x: 38, y: 92 },
          { x: 42, y: 87 },
          { x: 48, y: 95 },
          { x: 52, y: 93 },
        ],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgba(236, 72, 153, 1)',
        pointRadius: 8,
        pointHoverRadius: 12,
      },
    ],
  };

  // Chart data - Computed based on current dataset
  protected readonly chartData = computed(() => {
    const dataset = this.currentDataset();
    const chartType = this.currentChartType();

    // Only Bubble and Scatter need special datasets (different data format: x, y, r)
    if (chartType === 'bubble') {
      return this.bubbleDataset;
    }
    if (chartType === 'scatter') {
      return this.scatterDataset;
    }

    // Get the base dataset
    let baseData;
    switch (dataset) {
      case 'hours':
        baseData = this.hoursDataset;
        break;
      case 'team':
        baseData = this.teamDataset;
        break;
      case 'projects':
      default:
        baseData = this.projectsDataset;
        break;
    }

    // For radial chart types (Pie, Doughnut, Polar Area, Radar), transform to single-dataset format
    if (isRadialChartType(chartType)) {
      return transformToRadialDataset(baseData, dataset);
    }

    return baseData;
  });

  // Chart title - Computed based on chart type and dataset
  protected readonly chartTitle = computed(() => {
    const chartType = this.currentChartType();
    const dataset = this.currentDataset();

    // Special titles only for bubble and scatter (different data format)
    if (chartType === 'bubble') {
      return '📊 Team Performance Analysis (Bubble Chart) - 2026';
    }
    if (chartType === 'scatter') {
      return '📊 Project Metrics Correlation (Scatter Plot) - 2026';
    }

    // All other chart types use the selected dataset title
    let title = '📊 ';
    switch (dataset) {
      case 'hours':
        title += 'Working Hours';
        break;
      case 'team':
        title += 'Team Distribution';
        break;
      case 'projects':
      default:
        title += 'Project Statistics';
        break;
    }
    return `${title} - 2026`;
  });

  protected readonly chartOptions = computed(() => {
    const isDark = this.isDarkMode();

    // Colores adaptativos al tema
    const textColor = isDark ? '#e5e7eb' : '#374151';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';
    const tooltipBg = isDark ? 'rgba(24, 24, 27, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    const tooltipTitle = isDark ? '#fafafa' : '#1f2937';
    const tooltipBody = isDark ? '#d1d5db' : '#4b5563';
    const tooltipBorder = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)';

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            color: textColor,
            font: {
              size: 13,
              weight: '600',
            },
            padding: 15,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        title: {
          display: false,
        },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: tooltipTitle,
          bodyColor: tooltipBody,
          borderColor: tooltipBorder,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context: any) => {
              const chartType = this.currentChartType();
              const dataset = this.currentDataset();

              // Bubble chart - show x, y, r
              if (chartType === 'bubble') {
                const data = context.raw;
                return ` ${context.dataset.label}: (x: ${data.x}, y: ${data.y}, size: ${data.r})`;
              }

              // Scatter chart - show x, y
              if (chartType === 'scatter') {
                const data = context.raw;
                return ` ${context.dataset.label}: (x: ${data.x}, y: ${data.y})`;
              }

              // Get the actual value with fallback
              const value =
                context.parsed?.y ?? context.parsed?.r ?? context.raw ?? context.formattedValue;

              // All other charts use dataset-based labels
              if (dataset === 'hours') {
                return ` ${context.dataset.label}: ${value} hours`;
              } else if (dataset === 'team') {
                return ` ${context.dataset.label}: ${value} members`;
              }
              return ` ${context.dataset.label}: ${value} projects`;
            },
          },
        },
      },
      onClick: (event: any, elements: any) => {
        if (elements && elements.length > 0) {
          const element = elements[0];
          const chartType = this.currentChartType();
          const datasetLabel = this.chartData().datasets[element.datasetIndex].label;
          const value = this.chartData().datasets[element.datasetIndex].data[element.index];

          // Handle bubble and scatter (no labels, use coordinates)
          if (chartType === 'bubble' || chartType === 'scatter') {
            const coords = value as any;
            if (chartType === 'bubble') {
              this.selectedDataPoint.set(
                `${datasetLabel}: (x: ${coords.x}, y: ${coords.y}, size: ${coords.r})`,
              );
            } else {
              this.selectedDataPoint.set(`${datasetLabel}: (x: ${coords.x}, y: ${coords.y})`);
            }
          } else {
            // Regular charts with labels
            const chartData = this.chartData() as any;
            const label = chartData.labels ? chartData.labels[element.index] : '';
            this.selectedDataPoint.set(`${label}: ${datasetLabel} = ${value}`);
          }

          console.log('📊 Chart clicked:', {
            dataset: datasetLabel,
            chartType: chartType,
            value: value,
          });
        }
      },
      scales:
        this.currentChartType() === 'pie' || this.currentChartType() === 'doughnut'
          ? undefined
          : {
              x: {
                grid: {
                  color: gridColor,
                  drawBorder: false,
                },
                ticks: {
                  color: textColor,
                  font: {
                    size: 12,
                  },
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: gridColor,
                  drawBorder: false,
                },
                ticks: {
                  color: textColor,
                  font: {
                    size: 12,
                  },
                  stepSize: 1,
                },
              },
            },
    };
  });

  // Features data
  protected readonly features = signal<Feature[]>([
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Built with Angular 21 and optimized for maximum performance with ESBuild.',
    },
    {
      icon: '🎨',
      title: 'Modern Design',
      description:
        'Clean, responsive design that works beautifully on all devices and screen sizes.',
    },
    {
      icon: '🔒',
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with best practices and regular updates.',
    },
    {
      icon: '🚀',
      title: 'Easy to Use',
      description: 'Intuitive interface designed for the best user experience possible.',
    },
    {
      icon: '📱',
      title: 'Mobile First',
      description: 'Fully responsive design optimized for mobile devices and tablets.',
    },
    {
      icon: '💎',
      title: 'Premium Quality',
      description: 'Crafted with attention to detail and following industry standards.',
    },
  ]);

  // Methods
  protected scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  protected handleEmailSubmit(event: Event): void {
    event.preventDefault();
    const emailValue = this.email();

    if (emailValue && this.isValidEmail(emailValue)) {
      console.log('Email submitted:', emailValue);
      alert(`✅ Thanks for subscribing! We'll send updates to ${emailValue}`);
      this.email.set('');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Chart interaction methods
  protected onChartClick(event: any): void {
    if (event && event.element) {
      const datasetIndex = event.element.datasetIndex;
      const index = event.element.index;
      const chartType = this.currentChartType();
      const datasetLabel = this.chartData().datasets[datasetIndex].label;
      const value = this.chartData().datasets[datasetIndex].data[index];

      // Handle bubble and scatter (no labels, use coordinates)
      if (chartType === 'bubble' || chartType === 'scatter') {
        const coords = value as any;
        if (chartType === 'bubble') {
          this.selectedDataPoint.set(
            `${datasetLabel}: (x: ${coords.x}, y: ${coords.y}, size: ${coords.r})`,
          );
        } else {
          this.selectedDataPoint.set(`${datasetLabel}: (x: ${coords.x}, y: ${coords.y})`);
        }
      } else {
        // Regular charts with labels
        const chartData = this.chartData() as any;
        const label = chartData.labels ? chartData.labels[index] : '';
        this.selectedDataPoint.set(`${label}: ${datasetLabel} = ${value}`);
      }

      console.log('📊 Chart clicked:', {
        dataset: datasetLabel,
        value: value,
        datasetType: this.currentDataset(),
        chartType: chartType,
      });
    }
  }

  protected changeChartType(
    type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter',
  ): void {
    this.currentChartType.set(type);
    this.selectedDataPoint.set(null);
    console.log('📊 Chart type changed to:', type);
  }

  protected changeDataset(dataset: 'projects' | 'hours' | 'team'): void {
    this.currentDataset.set(dataset);
    this.selectedDataPoint.set(null);
    console.log('📊 Dataset changed to:', dataset);
  }
}
