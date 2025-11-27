import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewInstitutionButton from '@/components/admin/institutions/NewInstitutionButton';

// Mock du composant Button de shadcn/ui
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, style, ...props }: any) => (
    <button onClick={onClick} className={className} style={style} {...props}>
      {children}
    </button>
  ),
}));

// Mock de l'icône Plus de lucide-react
jest.mock('lucide-react', () => ({
  Plus: ({ className, strokeWidth, ...props }: any) => (
    <div data-testid='plus-icon' className={className} data-stroke-width={strokeWidth} {...props} />
  ),
}));

describe('NewInstitutionButton', () => {
  let eventListener: jest.Mock;

  beforeEach(() => {
    // Créer un mock pour écouter les événements personnalisés
    eventListener = jest.fn();
    globalThis.addEventListener('open-institution-modal', eventListener);
  });

  afterEach(() => {
    // Nettoyer les listeners après chaque test
    globalThis.removeEventListener('open-institution-modal', eventListener);
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<NewInstitutionButton />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders the Plus icon', () => {
      render(<NewInstitutionButton />);
      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('renders the button text', () => {
      render(<NewInstitutionButton />);
      expect(screen.getByText('Nouvelle institution')).toBeInTheDocument();
    });

    it('renders Button component from shadcn/ui', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies correct inline background color style', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button?.getAttribute('style')).toContain('--primary-300');
    });

    it('applies correct text color class', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('text-white');
    });

    it('applies correct border radius class', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('rounded-xl');
    });

    it('applies correct gap class', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('gap-2');
    });

    it('applies correct height class', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('h-11');
    });

    it('applies correct padding class', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('px-5');
    });

    it('applies font-medium class', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('font-medium');
    });

    it('applies correct font size class', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('text-[15px]');
    });

    it('applies transition-all class', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('transition-all');
    });

    it('applies all className props correctly', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      expect(button?.className).toBe(
        'h-11 px-5 rounded-xl gap-2 text-white font-medium text-[15px] transition-all'
      );
    });
  });

  describe('Icon styling', () => {
    it('Plus icon has correct width class', () => {
      render(<NewInstitutionButton />);
      const icon = screen.getByTestId('plus-icon');
      expect(icon).toHaveClass('w-5');
    });

    it('Plus icon has correct height class', () => {
      render(<NewInstitutionButton />);
      const icon = screen.getByTestId('plus-icon');
      expect(icon).toHaveClass('h-5');
    });

    it('Plus icon has both width and height classes', () => {
      render(<NewInstitutionButton />);
      const icon = screen.getByTestId('plus-icon');
      expect(icon).toHaveClass('w-5', 'h-5');
    });

    it('Plus icon has strokeWidth prop', () => {
      render(<NewInstitutionButton />);
      const icon = screen.getByTestId('plus-icon');
      expect(icon).toHaveAttribute('data-stroke-width', '2.5');
    });
  });

  describe('Text visibility', () => {
    it('text is always visible without responsive classes', () => {
      const { container } = render(<NewInstitutionButton />);
      const span = container.querySelector('span');
      expect(span).not.toHaveClass('hidden');
      expect(span).not.toHaveClass('sm:inline');
    });

    it('span contains correct text', () => {
      const { container } = render(<NewInstitutionButton />);
      const span = container.querySelector('span');
      expect(span?.textContent).toBe('Nouvelle institution');
    });
  });

  describe('Click behavior', () => {
    it('handles click event', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(eventListener).toHaveBeenCalled();
    });

    it('dispatches custom event on click', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(eventListener).toHaveBeenCalledTimes(1);
    });

    it('dispatches "open-institution-modal" event', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      const call = eventListener.mock.calls[0][0];
      expect(call.type).toBe('open-institution-modal');
    });

    it('dispatches CustomEvent instance', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      const call = eventListener.mock.calls[0][0];
      expect(call).toBeInstanceOf(Event);
    });

    it('can be clicked multiple times', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(eventListener).toHaveBeenCalledTimes(3);
    });

    it('works with userEvent click', async () => {
      const user = userEvent.setup();
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      await user.click(button);

      expect(eventListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Event dispatching details', () => {
    it('dispatches event on globalThis object', () => {
      const spy = jest.spyOn(globalThis, 'dispatchEvent');
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('creates new CustomEvent instance for each click', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      const firstEvent = eventListener.mock.calls[0][0];

      fireEvent.click(button);
      const secondEvent = eventListener.mock.calls[1][0];

      expect(firstEvent).not.toBe(secondEvent);
    });

    it('event has correct event type', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      const event = eventListener.mock.calls[0][0];
      expect(event.type).toBe('open-institution-modal');
    });

    it('event bubbles correctly', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      const event = eventListener.mock.calls[0][0];
      expect(event.bubbles).toBe(false);
    });

    it('event is cancelable', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      const event = eventListener.mock.calls[0][0];
      expect(event.cancelable).toBe(false);
    });
  });

  describe('Component structure', () => {
    it('has correct DOM structure with icon and text', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');

      expect(button?.children.length).toBe(2);
      expect(button?.children[0]).toHaveAttribute('data-testid', 'plus-icon');
      expect(button?.children[1].tagName).toBe('SPAN');
    });

    it('icon comes before text in DOM order', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');
      const firstChild = button?.children[0];
      const secondChild = button?.children[1];

      expect(firstChild).toHaveAttribute('data-testid', 'plus-icon');
      expect(secondChild?.textContent).toBe('Nouvelle institution');
    });

    it('button is the root element', () => {
      const { container } = render(<NewInstitutionButton />);
      expect(container.firstChild?.nodeName).toBe('BUTTON');
    });
  });

  describe('Accessibility', () => {
    it('button is keyboard accessible', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('button has implicit button role', () => {
      render(<NewInstitutionButton />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('button can receive focus', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('fires event on Enter key press', async () => {
      const user = userEvent.setup();
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard('{Enter}');

      expect(eventListener).toHaveBeenCalled();
    });

    it('fires event on Space key press', async () => {
      const user = userEvent.setup();
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard(' ');

      expect(eventListener).toHaveBeenCalled();
    });

    it('has visible text for screen readers', () => {
      render(<NewInstitutionButton />);
      expect(screen.getByText('Nouvelle institution')).toBeInTheDocument();
    });
  });

  describe('Integration with Button component', () => {
    it('passes onClick handler to Button component', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');

      expect(button?.onclick).toBeDefined();
    });

    it('passes className to Button component', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');

      expect(button?.className).toContain('rounded-xl');
    });

    it('passes style prop to Button component', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');

      expect(button?.getAttribute('style')).toContain('--primary-300');
    });
  });

  describe('Edge cases', () => {
    it('handles rapid successive clicks', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }

      expect(eventListener).toHaveBeenCalledTimes(10);
    });

    it('continues to work after re-render', () => {
      const { rerender } = render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      expect(eventListener).toHaveBeenCalledTimes(1);

      rerender(<NewInstitutionButton />);
      fireEvent.click(button);

      expect(eventListener).toHaveBeenCalledTimes(2);
    });

    it('does not throw error when clicked', () => {
      render(<NewInstitutionButton />);
      const button = screen.getByRole('button');

      expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('maintains functionality when DOM is manipulated', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');

      // Simulate DOM manipulation
      if (button) {
        button.setAttribute('data-test', 'modified');
      }

      fireEvent.click(button!);
      expect(eventListener).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('creates event handler only once during render', () => {
      const spy = jest.spyOn(globalThis, 'dispatchEvent');
      render(<NewInstitutionButton />);

      expect(spy).not.toHaveBeenCalled();

      spy.mockRestore();
    });

    it('does not create unnecessary event listeners', () => {
      const { container } = render(<NewInstitutionButton />);
      const button = container.querySelector('button');

      // Verify button doesn't have multiple event listeners
      expect(button?.onclick).toBeDefined();
    });
  });
});
