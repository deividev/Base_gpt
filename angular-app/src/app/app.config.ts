import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  APP_INITIALIZER,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { ThemeService } from './core/services';
import { errorInterceptor, loadingInterceptor } from './core/interceptors';

import { routes } from './app.routes';

/**
 * Theme System Initializer
 * Applies active theme before rendering the application
 */
function initializeThemeSystem(themeService: ThemeService) {
  return () => {
    // ThemeService applies theme automatically in its constructor
    // This initializer ensures the service is instantiated before rendering
    console.log(`🎨 Theme System initialized: ${themeService.currentConfig().name}`);
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor, loadingInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: 'none', // Using our own styles
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeThemeSystem,
      deps: [ThemeService],
      multi: true,
    },
  ],
};
