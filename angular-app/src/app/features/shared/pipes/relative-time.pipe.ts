import { Pipe, PipeTransform } from '@angular/core';

/**
 * Relative Time Pipe
 *
 * Converts dates to relative time strings like "hace 5 minutos"
 *
 * @example
 * ```html
 * {{ createdAt | relativeTime }}
 * {{ createdAt | relativeTime:'en' }}
 * ```
 */
@Pipe({
  name: 'relativeTime',
  standalone: true,
})
export class RelativeTimePipe implements PipeTransform {
  private readonly translations = {
    es: {
      now: 'ahora mismo',
      seconds: 'hace segundos',
      minute: 'hace 1 minuto',
      minutes: 'hace {n} minutos',
      hour: 'hace 1 hora',
      hours: 'hace {n} horas',
      day: 'hace 1 día',
      days: 'hace {n} días',
      week: 'hace 1 semana',
      weeks: 'hace {n} semanas',
      month: 'hace 1 mes',
      months: 'hace {n} meses',
      year: 'hace 1 año',
      years: 'hace {n} años',
      future: 'en el futuro',
    },
    en: {
      now: 'just now',
      seconds: 'seconds ago',
      minute: '1 minute ago',
      minutes: '{n} minutes ago',
      hour: '1 hour ago',
      hours: '{n} hours ago',
      day: '1 day ago',
      days: '{n} days ago',
      week: '1 week ago',
      weeks: '{n} weeks ago',
      month: '1 month ago',
      months: '{n} months ago',
      year: '1 year ago',
      years: '{n} years ago',
      future: 'in the future',
    },
  };

  transform(value: Date | string | number | null | undefined, lang: 'es' | 'en' = 'es'): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const t = this.translations[lang];

    // Future date
    if (diffMs < 0) {
      return t.future;
    }

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 10) {
      return t.now;
    }
    if (seconds < 60) {
      return t.seconds;
    }
    if (minutes === 1) {
      return t.minute;
    }
    if (minutes < 60) {
      return t.minutes.replace('{n}', minutes.toString());
    }
    if (hours === 1) {
      return t.hour;
    }
    if (hours < 24) {
      return t.hours.replace('{n}', hours.toString());
    }
    if (days === 1) {
      return t.day;
    }
    if (days < 7) {
      return t.days.replace('{n}', days.toString());
    }
    if (weeks === 1) {
      return t.week;
    }
    if (weeks < 4) {
      return t.weeks.replace('{n}', weeks.toString());
    }
    if (months === 1) {
      return t.month;
    }
    if (months < 12) {
      return t.months.replace('{n}', months.toString());
    }
    if (years === 1) {
      return t.year;
    }
    return t.years.replace('{n}', years.toString());
  }
}
