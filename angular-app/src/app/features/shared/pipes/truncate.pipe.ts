import { Pipe, PipeTransform } from '@angular/core';

/**
 * Truncate Pipe
 * 
 * Truncates text to a specified length with ellipsis
 * 
 * @example
 * ```html
 * {{ longText | truncate:50 }}
 * {{ longText | truncate:100:'...' }}
 * {{ longText | truncate:30:'[más]':true }}
 * ```
 */
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    limit: number = 100,
    ellipsis: string = '...',
    preserveWord: boolean = false
  ): string {
    if (!value) {
      return '';
    }

    if (value.length <= limit) {
      return value;
    }

    if (preserveWord) {
      // Find the last space before the limit
      const truncated = value.substring(0, limit);
      const lastSpace = truncated.lastIndexOf(' ');
      
      if (lastSpace > limit * 0.5) {
        return truncated.substring(0, lastSpace) + ellipsis;
      }
    }

    return value.substring(0, limit).trim() + ellipsis;
  }
}
