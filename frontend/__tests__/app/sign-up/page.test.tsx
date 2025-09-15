import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@clerk/nextjs', () => ({
  useSignUp: () => ({ signUp: { create: jest.fn(() => ({ prepareEmailAddressVerification: jest.fn() })) }, setActive: jest.fn() })
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe('SignUp page', () => {
  it('renders all input fields and labels', async () => {
    const { default: SignUp } = await import('@/app/sign-up/page');
    render(<SignUp />);
    expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeInTheDocument();
  });

  it('shows validation errors if fields are empty and form is submitted', async () => {
    const { default: SignUp } = await import('@/app/sign-up/page');
    render(<SignUp />);
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/doit contenir au moins/i).length).toBeGreaterThan(0);
    });
  });

  it('shows error if email is invalid', async () => {
    const { default: SignUp } = await import('@/app/sign-up/page');
    render(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
    });
  });

  it('shows error if password is too short', async () => {
    const { default: SignUp } = await import('@/app/sign-up/page');
    render(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    await waitFor(() => {
      // Match the localized message even if it includes a leading article
      expect(screen.getByText(/doit contenir au moins 8 caractères/i)).toBeInTheDocument();
    });
  });

  it('submits the form with valid data', async () => {
    const { default: SignUp } = await import('@/app/sign-up/page');
    render(<SignUp />);
    fireEvent.change(screen.getByPlaceholderText(/prénom/i), { target: { value: 'Jean' } });
    fireEvent.change(screen.getByPlaceholderText(/nom/i), { target: { value: 'Dupont' } });
    fireEvent.change(screen.getByPlaceholderText(/email/i), { target: { value: 'jean.dupont@email.com' } });
    fireEvent.change(screen.getByPlaceholderText(/mot de passe/i), { target: { value: 'Password1!' } });
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    await waitFor(() => {
      expect(screen.queryByText(/doit contenir au moins/i)).not.toBeInTheDocument();
    });
  });
});