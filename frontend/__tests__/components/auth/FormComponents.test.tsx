import { render, screen, fireEvent } from '@testing-library/react';
import { Phone } from 'lucide-react';

import { InputField, ErrorMessage, SubmitButton } from '@/components/auth/FormComponents';

describe('FormComponents', () => {
  describe('InputField', () => {
    const defaultProps = {
      id: 'test-input',
      label: 'Test Label',
      value: '',
      onChange: jest.fn(),
    };

    it('renders input field with label', () => {
      render(<InputField {...defaultProps} />);

      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders input field with icon', () => {
      render(<InputField {...defaultProps} icon={Phone} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      // Icon should be present (Phone icon)
      const iconElement = screen.getByRole('textbox').parentElement?.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
    });

    it('shows error message when hasError is true', () => {
      render(<InputField {...defaultProps} hasError={true} errorMessage='Test error' />);

      expect(screen.getByText('Test error')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('calls onChange when input value changes', () => {
      const onChange = jest.fn();
      render(<InputField {...defaultProps} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('applies disabled state correctly', () => {
      render(<InputField {...defaultProps} disabled={true} />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('applies required attribute correctly', () => {
      render(<InputField {...defaultProps} required={true} />);

      expect(screen.getByRole('textbox')).toBeRequired();
    });
  });

  describe('ErrorMessage', () => {
    it('renders error message with correct attributes', () => {
      render(<ErrorMessage id='test-error' message='Test error message' />);

      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Test error message');
      expect(errorElement).toHaveAttribute('id', 'test-error');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('SubmitButton', () => {
    it('renders submit button with children', () => {
      render(<SubmitButton isLoading={false}>Submit Text</SubmitButton>);

      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('Submit Text')).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<SubmitButton isLoading={true}>Submit Text</SubmitButton>);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disables button when disabled prop is true', () => {
      render(
        <SubmitButton isLoading={false} disabled={true}>
          Submit Text
        </SubmitButton>
      );

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies custom className', () => {
      render(
        <SubmitButton isLoading={false} className='custom-class'>
          Submit Text
        </SubmitButton>
      );

      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });
});
