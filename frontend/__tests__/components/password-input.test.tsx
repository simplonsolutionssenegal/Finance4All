import { render, screen, fireEvent } from '@testing-library/react';

import { PasswordInput } from '@/components/password-input';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Eye: () => <div data-testid='eye-icon'>Eye</div>,
  EyeOff: () => <div data-testid='eye-off-icon'>EyeOff</div>,
  Lock: () => <div data-testid='lock-icon'>Lock</div>,
}));

describe('PasswordInput', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<PasswordInput placeholder='Enter password' />);

      const input = screen.getByPlaceholderText('Enter password');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('renders with custom placeholder', () => {
      render(<PasswordInput placeholder='Custom placeholder' />);

      const input = screen.getByPlaceholderText('Custom placeholder');
      expect(input).toBeInTheDocument();
    });

    it('renders with toggle button by default', () => {
      render(<PasswordInput placeholder='Enter password' />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveAttribute('aria-label', 'Afficher le mot de passe');
    });

    it('hides toggle button when showPasswordToggle is false', () => {
      render(<PasswordInput showPasswordToggle={false} placeholder='Enter password' />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility when button is clicked', () => {
      render(<PasswordInput placeholder='Enter password' />);

      const input = screen.getByPlaceholderText('Enter password');
      const toggleButton = screen.getByRole('button');

      // Initially password type
      expect(input).toHaveAttribute('type', 'password');
      expect(toggleButton).toHaveAttribute('aria-label', 'Afficher le mot de passe');

      // Click to show password
      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
      expect(toggleButton).toHaveAttribute('aria-label', 'Masquer le mot de passe');

      // Click to hide password
      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
      expect(toggleButton).toHaveAttribute('aria-label', 'Afficher le mot de passe');
    });

    it('shows correct icon based on visibility state', () => {
      render(<PasswordInput placeholder='Enter password' />);

      const toggleButton = screen.getByRole('button');

      // Initially shows Eye icon
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();

      // Click to show password
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();

      // Click to hide password
      fireEvent.click(toggleButton);
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });
  });

  describe('Input Attributes', () => {
    it('has correct default attributes', () => {
      render(<PasswordInput placeholder='Enter password' />);

      const input = screen.getByPlaceholderText('Enter password');
      expect(input).toHaveAttribute('autoComplete', 'new-password');
      expect(input).toHaveAttribute('autoCorrect', 'off');
      expect(input).toHaveAttribute('autoCapitalize', 'off');
      expect(input).toHaveAttribute('spellCheck', 'false');
    });

    it('applies custom attributes', () => {
      render(
        <PasswordInput id='custom-password' placeholder='Custom placeholder' disabled required />
      );

      const input = screen.getByPlaceholderText('Custom placeholder');
      expect(input).toHaveAttribute('id', 'custom-password');
      expect(input).toHaveAttribute('placeholder', 'Custom placeholder');
      expect(input).toBeDisabled();
      expect(input).toBeRequired();
    });
  });

  describe('Event Handling', () => {
    it('calls onChange when input value changes', () => {
      const handleChange = jest.fn();
      render(<PasswordInput onChange={handleChange} placeholder='Enter password' />);

      const input = screen.getByPlaceholderText('Enter password');
      fireEvent.change(input, { target: { value: 'newpassword' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('handles focus and blur events', () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();

      render(
        <PasswordInput onFocus={handleFocus} onBlur={handleBlur} placeholder='Enter password' />
      );

      const input = screen.getByPlaceholderText('Enter password');

      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);

      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for toggle button', () => {
      render(<PasswordInput placeholder='Enter password' />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-label', 'Afficher le mot de passe');
      expect(toggleButton).toHaveAttribute('tabIndex', '-1');
    });

    it('updates aria-label when visibility changes', () => {
      render(<PasswordInput placeholder='Enter password' />);

      const toggleButton = screen.getByRole('button');

      fireEvent.click(toggleButton);
      expect(toggleButton).toHaveAttribute('aria-label', 'Masquer le mot de passe');
    });
  });

  describe('Styling', () => {
    it('applies correct classes for layout', () => {
      render(<PasswordInput placeholder='Enter password' />);

      const container = screen.getByPlaceholderText('Enter password').closest('div');
      expect(container).toHaveClass('relative');

      const input = screen.getByPlaceholderText('Enter password');
      expect(input).toHaveClass('pl-10', 'pr-10');
    });

    it('applies custom className correctly', () => {
      render(<PasswordInput className='custom-input-class' placeholder='Enter password' />);

      const input = screen.getByPlaceholderText('Enter password');
      expect(input).toHaveClass('custom-input-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined onChange gracefully', () => {
      render(<PasswordInput placeholder='Enter password' />);

      const input = screen.getByPlaceholderText('Enter password');
      expect(() => {
        fireEvent.change(input, { target: { value: 'test' } });
      }).not.toThrow();
    });

    it('works with ref forwarding', () => {
      const ref = jest.fn();
      render(<PasswordInput ref={ref} placeholder='Enter password' />);

      expect(ref).toHaveBeenCalled();
    });

    it('handles multiple toggle clicks', () => {
      render(<PasswordInput placeholder='Enter password' />);

      const input = screen.getByPlaceholderText('Enter password');
      const toggleButton = screen.getByRole('button');

      // Multiple clicks
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);

      // Should be in text mode (even number of clicks)
      expect(input).toHaveAttribute('type', 'text');
    });
  });
});
