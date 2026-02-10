import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from './navbar';
import { ThemeService } from '../../../../core/services';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let themeService: ThemeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [ThemeService]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    themeService = TestBed.inject(ThemeService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Outputs', () => {
    it('should emit sectionClick when navigateToSection is called', () => {
      const sectionClickSpy = vi.fn();
      component.sectionClick.subscribe(sectionClickSpy);

      // Access protected method through casting
      (component as any).navigateToSection('features');

      expect(sectionClickSpy).toHaveBeenCalledWith('features');
    });
  });

  describe('Menu Toggle', () => {
    it('should toggle menu state', () => {
      expect((component as any).isMenuOpen()).toBe(false);
      
      (component as any).toggleMenu();
      expect((component as any).isMenuOpen()).toBe(true);
      
      (component as any).toggleMenu();
      expect((component as any).isMenuOpen()).toBe(false);
    });

    it('should close theme panel when menu opens', () => {
      (component as any).isThemePanelOpen.set(true);
      (component as any).toggleMenu();
      
      expect((component as any).isMenuOpen()).toBe(true);
      expect((component as any).isThemePanelOpen()).toBe(false);
    });
  });

  describe('Theme Panel Toggle', () => {
    it('should toggle theme panel state', () => {
      expect((component as any).isThemePanelOpen()).toBe(false);
      
      (component as any).toggleThemePanel();
      expect((component as any).isThemePanelOpen()).toBe(true);
      
      (component as any).toggleThemePanel();
      expect((component as any).isThemePanelOpen()).toBe(false);
    });

    it('should close menu when theme panel opens', () => {
      (component as any).isMenuOpen.set(true);
      (component as any).toggleThemePanel();
      
      expect((component as any).isThemePanelOpen()).toBe(true);
      expect((component as any).isMenuOpen()).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should close menu and theme panel when navigating', () => {
      (component as any).isMenuOpen.set(true);
      (component as any).isThemePanelOpen.set(true);
      
      (component as any).navigateToSection('contact');
      
      expect((component as any).isMenuOpen()).toBe(false);
      expect((component as any).isThemePanelOpen()).toBe(false);
    });
  });
});
