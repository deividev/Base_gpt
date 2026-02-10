import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Landing } from './landing';
import { ThemeService } from '../../core/services';

describe('Landing', () => {
  let component: Landing;
  let fixture: ComponentFixture<Landing>;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [ThemeService],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('State', () => {
    it('should have empty email by default', () => {
      expect((component as any).email()).toBe('');
    });

    it('should have default chart type as bar', () => {
      expect((component as any).currentChartType()).toBe('bar');
    });

    it('should have default dataset as projects', () => {
      expect((component as any).currentDataset()).toBe('projects');
    });

    it('should have null selected data point by default', () => {
      expect((component as any).selectedDataPoint()).toBeNull();
    });
  });

  describe('Projects Data', () => {
    it('should have projects defined', () => {
      expect((component as any).projects()).toBeDefined();
      expect((component as any).projects().length).toBeGreaterThan(0);
    });

    it('should have project columns defined', () => {
      expect((component as any).projectColumns()).toBeDefined();
      expect((component as any).projectColumns().length).toBeGreaterThan(0);
    });
  });

  describe('Theme Integration', () => {
    it('should have isDarkMode computed', () => {
      expect((component as any).isDarkMode).toBeDefined();
    });

    it('should reflect theme service mode', () => {
      // Set to light mode first
      themeService.setTheme('blue');
      fixture.detectChanges();

      const config = themeService.currentConfig();
      const expectedDark = config.mode === 'dark';
      expect((component as any).isDarkMode()).toBe(expectedDark);
    });
  });

  describe('Navigation', () => {
    it('should scroll to section when scrollToSection is called', () => {
      const scrollIntoViewMock = vi.fn();
      const mockElement = { scrollIntoView: scrollIntoViewMock };

      vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

      (component as any).scrollToSection('features');

      expect(document.getElementById).toHaveBeenCalledWith('features');
      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

      vi.restoreAllMocks();
    });

    it('should not throw if section not found', () => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null);

      expect(() => (component as any).scrollToSection('nonexistent')).not.toThrow();

      vi.restoreAllMocks();
    });
  });
});
