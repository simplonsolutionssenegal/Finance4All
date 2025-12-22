import { render, screen } from '@testing-library/react';
import { ServiceSimulator } from '@/components/service-simulator/service-simulator';
import PublicFooter from '@/components/public/layout/footer';
import ServiceSimulatorPage from '@/app/(public)/simulator/page';

jest.mock('@/components/service-simulator/service-simulator', () => ({
  ServiceSimulator: jest.fn(() => (
    <div data-testid='service-simulator'>ServiceSimulator Component</div>
  )),
}));

jest.mock('@/components/public/layout/footer', () => ({
  __esModule: true,
  default: jest.fn(() => <footer data-testid='public-footer'>Footer Component</footer>),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ back: jest.fn() })),
}));

jest.mock('@/hooks/useSimulator', () => ({
  useSimulator: jest.fn(() => ({
    params: {
      institution: null,
      service: null,
      amount: 0,
      selectedPlafondIndex: 0,
    },
    institutions: [],
    isLoading: false,
    updateParam: jest.fn(),
    getAvailableServices: jest.fn(() => []),
    resetSimulation: jest.fn(),
  })),
}));

describe('ServiceSimulatorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendu de la page', () => {
    it('rend la page sans erreur', () => {
      render(<ServiceSimulatorPage />);

      const container = screen.getByTestId('service-simulator').parentElement;
      expect(container).toBeInTheDocument();
    });

    it('applique les classes CSS correctes au conteneur', () => {
      const { container } = render(<ServiceSimulatorPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('min-h-screen');
      expect(mainDiv).toHaveClass('overflow-visible');
    });

    it('rend le composant ServiceSimulator', () => {
      render(<ServiceSimulatorPage />);

      expect(screen.getByTestId('service-simulator')).toBeInTheDocument();
      expect(ServiceSimulator).toHaveBeenCalled();
    });

    it('ne rend PAS le composant PublicFooter', () => {
      render(<ServiceSimulatorPage />);
      expect(screen.queryByTestId('public-footer')).not.toBeInTheDocument();
      expect(PublicFooter).not.toHaveBeenCalled();
    });
  });

  describe('Structure de la page', () => {
    it('a une structure DOM correcte', () => {
      const { container } = render(<ServiceSimulatorPage />);
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.tagName).toBe('DIV');
      expect(mainDiv.children.length).toBe(1);
    });

    it('le ServiceSimulator est le seul enfant direct du conteneur', () => {
      const { container } = render(<ServiceSimulatorPage />);

      const mainDiv = container.firstChild as HTMLElement;
      const children = Array.from(mainDiv.children);

      expect(children.length).toBe(1);
      expect(children[0].getAttribute('data-testid')).toBe('service-simulator');
    });
  });

  describe('Accessibilité', () => {
    it("le conteneur principal n'a pas de violations d'accessibilité de base", () => {
      const { container } = render(<ServiceSimulatorPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toBeVisible();
      expect(mainDiv).not.toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Responsive', () => {
    it('applique min-h-screen pour occuper toute la hauteur', () => {
      const { container } = render(<ServiceSimulatorPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('min-h-screen');
    });

    it('applique overflow-visible pour gérer les dropdowns/modals', () => {
      const { container } = render(<ServiceSimulatorPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('overflow-visible');
    });
  });

  describe('Intégration avec ServiceSimulator', () => {
    it('ServiceSimulator est appelé une seule fois', () => {
      render(<ServiceSimulatorPage />);
      expect(ServiceSimulator).toHaveBeenCalledTimes(1);
    });

    it('ServiceSimulator ne reçoit aucune prop', () => {
      render(<ServiceSimulatorPage />);

      const callArgs = (ServiceSimulator as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toEqual({});
    });
  });

  describe('Snapshot', () => {
    it('correspond au snapshot', () => {
      const { container } = render(<ServiceSimulatorPage />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
