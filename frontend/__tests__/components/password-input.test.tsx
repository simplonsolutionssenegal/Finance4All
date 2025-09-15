import { render, screen, fireEvent } from '@testing-library/react';

import { PasswordInput } from '@/components/password-input';

describe('PasswordInput', () => {
  it('renders without crashing', () => {
    render(<PasswordInput />);
    const input = screen.getByDisplayValue('');
    expect(input).toBeInTheDocument();
  });

  it('renders as password input by default', () => {
    render(<PasswordInput />);
    const input = screen.getByDisplayValue('');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('shows password toggle button by default', () => {
    render(<PasswordInput />);
    const toggleButton = screen.getByRole('button', { name: /afficher le mot de passe/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('can hide password toggle button', () => {
    render(<PasswordInput showPasswordToggle={false} />);
    const toggleButton = screen.queryByRole('button', { name: /afficher le mot de passe/i });
    expect(toggleButton).not.toBeInTheDocument();
  });

  it('toggles password visibility when button is clicked', () => {
    render(<PasswordInput />);
    const input = screen.getByDisplayValue('');
    const toggleButton = screen.getByRole('button', { name: /afficher le mot de passe/i });

    // Initially password type
    expect(input).toHaveAttribute('type', 'password');

    // Click to show password
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(toggleButton).toHaveAttribute('aria-label', 'Masquer le mot de passe');

    // Click to hide password again
    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
    expect(toggleButton).toHaveAttribute('aria-label', 'Afficher le mot de passe');
  });

  it('handles input value changes', () => {
    render(<PasswordInput />);
    const input = screen.getByDisplayValue('');

    fireEvent.change(input, { target: { value: 'testpassword' } });
    expect(input).toHaveValue('testpassword');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<PasswordInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('applies custom className', () => {
    render(<PasswordInput className='custom-class' />);
    const input = screen.getByDisplayValue('');
    expect(input).toHaveClass('custom-class');
  });

  it('applies padding when password toggle is enabled', () => {
    render(<PasswordInput />);
    const input = screen.getByDisplayValue('');
    expect(input).toHaveClass('pr-10');
  });

  it('does not apply padding when password toggle is disabled', () => {
    render(<PasswordInput showPasswordToggle={false} />);
    const input = screen.getByDisplayValue('');
    expect(input).not.toHaveClass('pr-10');
  });

  it('sets correct autocomplete attributes', () => {
    render(<PasswordInput />);
    const input = screen.getByDisplayValue('');
    expect(input).toHaveAttribute('autocomplete', 'new-password');
    expect(input).toHaveAttribute('autocorrect', 'off');
    expect(input).toHaveAttribute('autocapitalize', 'off');
    expect(input).toHaveAttribute('spellcheck', 'false');
  });

  it('forwards other props to input', () => {
    render(<PasswordInput placeholder='Enter password' disabled />);
    const input = screen.getByDisplayValue('');
    expect(input).toHaveAttribute('placeholder', 'Enter password');
    expect(input).toBeDisabled();
  });

  it('has correct tabIndex for toggle button', () => {
    render(<PasswordInput />);
    const toggleButton = screen.getByRole('button', { name: /afficher le mot de passe/i });
    expect(toggleButton).toHaveAttribute('tabIndex', '-1');
  });
});
