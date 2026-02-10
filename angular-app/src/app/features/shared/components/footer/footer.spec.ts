import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Footer } from './footer';

describe('Footer', () => {
  let component: Footer;
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('State', () => {
    it('should have current year', () => {
      const currentYear = new Date().getFullYear();
      expect((component as any).currentYear()).toBe(currentYear);
    });
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

  describe('Rendering', () => {
    it('should render current year', () => {
      const currentYear = new Date().getFullYear();
      const element = fixture.nativeElement;
      expect(element.textContent).toContain(currentYear.toString());
    });
  });
});
