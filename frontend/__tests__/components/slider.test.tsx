import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Slider } from '@/components/slider';

const defaultProps = {
  value: 50,
  onChange: jest.fn(),
  min: 0,
  max: 100,
  step: 1,
  label: 'Test Slider',
  icon: '🎯',
  formatValue: (value: number) => `${value}%`,
};

describe('Slider', () => {
  beforeEach(() => {
    defaultProps.onChange.mockClear();
  });

  describe('Rendu initial', () => {
    it('should render the slider with correct props', () => {
      render(<Slider {...defaultProps} />);

      expect(screen.getByText(/Test Slider/)).toBeInTheDocument();
      expect(screen.getByText(/🎯/)).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getAllByText('0%')[0]).toBeInTheDocument();
      expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(<Slider {...defaultProps} className='custom-class' />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should display correct percentage based on value', () => {
      render(<Slider {...defaultProps} value={75} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('Interactions avec les boutons', () => {
    it('should call onChange when increment button is clicked', async () => {
      const user = userEvent.setup();
      render(<Slider {...defaultProps} value={50} />);

      const incrementButton = screen.getByLabelText('Augmenter Test Slider');
      await user.click(incrementButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith(51);
    });

    it('should call onChange when decrement button is clicked', async () => {
      const user = userEvent.setup();
      render(<Slider {...defaultProps} value={50} />);

      const decrementButton = screen.getByLabelText('Diminuer Test Slider');
      await user.click(decrementButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith(49);
    });

    it('should disable increment button when at maximum', () => {
      render(<Slider {...defaultProps} value={100} />);

      const incrementButton = screen.getByLabelText('Augmenter Test Slider');
      expect(incrementButton).toBeDisabled();
    });

    it('should disable decrement button when at minimum', () => {
      render(<Slider {...defaultProps} value={0} />);

      const decrementButton = screen.getByLabelText('Diminuer Test Slider');
      expect(decrementButton).toBeDisabled();
    });

    it('should respect step value for increment/decrement', async () => {
      const user = userEvent.setup();
      render(<Slider {...defaultProps} value={50} step={5} />);

      const incrementButton = screen.getByLabelText('Augmenter Test Slider');
      await user.click(incrementButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith(55);
    });
  });

  describe('Interactions avec le slider', () => {
    it('should call onChange when slider is clicked', async () => {
      const user = userEvent.setup();
      render(<Slider {...defaultProps} />);

      const slider = screen.getByRole('slider');
      await user.click(slider);

      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('should handle mouse drag interactions', () => {
      render(<Slider {...defaultProps} />);

      const slider = screen.getByRole('slider');

      // Simuler un drag
      fireEvent.mouseDown(slider, { clientX: 100 });
      fireEvent.mouseMove(slider, { clientX: 200 });
      fireEvent.mouseUp(slider);

      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('should handle touch interactions', () => {
      render(<Slider {...defaultProps} />);

      const slider = screen.getByRole('slider');

      // Simuler un touch
      fireEvent.touchStart(slider, { touches: [{ clientX: 100 }] });
      fireEvent.touchMove(slider, { touches: [{ clientX: 200 }] });
      fireEvent.touchEnd(slider);

      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  describe('Accessibilité', () => {
    it('should have proper ARIA attributes', () => {
      render(<Slider {...defaultProps} />);

      const slider = screen.getByRole('slider');
      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
      expect(slider).toHaveAttribute('aria-valuenow', '50');
      expect(slider).toHaveAttribute('aria-label', 'Test Slider');
    });

    it('should have accessible button labels', () => {
      render(<Slider {...defaultProps} />);

      expect(screen.getByLabelText('Augmenter Test Slider')).toBeInTheDocument();
      expect(screen.getByLabelText('Diminuer Test Slider')).toBeInTheDocument();
    });
  });

  describe('Gestion des valeurs limites', () => {
    it('should handle values at minimum correctly', () => {
      render(<Slider {...defaultProps} value={0} />);

      expect(screen.getAllByText('0%')[0]).toBeInTheDocument();
      expect(screen.getByLabelText('Diminuer Test Slider')).toBeDisabled();
    });

    it('should handle values at maximum correctly', () => {
      render(<Slider {...defaultProps} value={100} />);

      expect(screen.getAllByText('100%')[0]).toBeInTheDocument();
      expect(screen.getByLabelText('Augmenter Test Slider')).toBeDisabled();
    });

    it('should handle custom min/max values', () => {
      render(<Slider {...defaultProps} min={10} max={90} value={50} />);

      expect(screen.getByText('10%')).toBeInTheDocument();
      expect(screen.getByText('90%')).toBeInTheDocument();
    });
  });

  describe('Formatage des valeurs', () => {
    it('should use custom formatValue function', () => {
      const customFormat = (value: number) => `$${value}`;
      render(<Slider {...defaultProps} formatValue={customFormat} />);

      expect(screen.getByText('$50')).toBeInTheDocument();
      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('$100')).toBeInTheDocument();
    });

    it('should display formatted values in slider limits', () => {
      const customFormat = (value: number) => `${value}€`;
      render(<Slider {...defaultProps} formatValue={customFormat} />);

      expect(screen.getByText('0€')).toBeInTheDocument();
      expect(screen.getByText('100€')).toBeInTheDocument();
    });
  });

  describe('Gestion des événements', () => {
    it('should clean up event listeners on unmount', () => {
      // Ce test vérifie que le composant se démonte sans erreur
      const { unmount } = render(<Slider {...defaultProps} />);

      // Le composant doit se démonter sans erreur
      expect(() => unmount()).not.toThrow();
    });

    it('should handle rapid value changes', async () => {
      const user = userEvent.setup();
      render(<Slider {...defaultProps} value={50} />);

      const incrementButton = screen.getByLabelText('Augmenter Test Slider');

      // Clics rapides
      await user.click(incrementButton);
      await user.click(incrementButton);
      await user.click(incrementButton);

      expect(defaultProps.onChange).toHaveBeenCalledTimes(3);
      expect(defaultProps.onChange).toHaveBeenNthCalledWith(1, 51);
      expect(defaultProps.onChange).toHaveBeenNthCalledWith(2, 51);
      expect(defaultProps.onChange).toHaveBeenNthCalledWith(3, 51);
    });
  });

  describe('Props personnalisées', () => {
    it('should handle different step values', async () => {
      const user = userEvent.setup();
      render(<Slider {...defaultProps} value={50} step={10} />);

      const incrementButton = screen.getByLabelText('Augmenter Test Slider');
      await user.click(incrementButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith(60);
    });

    it('should handle decimal step values', async () => {
      const user = userEvent.setup();
      render(<Slider {...defaultProps} value={50} step={0.5} />);

      const incrementButton = screen.getByLabelText('Augmenter Test Slider');
      await user.click(incrementButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith(50.5);
    });

    it('should handle custom icon', () => {
      render(<Slider {...defaultProps} icon={<span data-testid='custom-icon'>🔥</span>} />);

      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });
  });
});
