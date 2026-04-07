import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import ContactForm from '@/components/public/contact/contact-form';

function renderWithQueryClient(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('ContactForm', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('keeps submit disabled while form is invalid', () => {
    renderWithQueryClient(<ContactForm />);
    const submit = screen.getByRole('button', { name: /envoyer le message/i });
    expect(submit).toBeDisabled();
  });

  it('enables submit when required fields are valid', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, message: 'ok', attemptsRemaining: 2 }),
    });

    renderWithQueryClient(<ContactForm />);

    await user.type(screen.getByLabelText(/prénom/i), 'Lamine');
    await user.type(screen.getByLabelText(/^nom/i), 'Kone');
    await user.type(screen.getByLabelText(/^email/i), 'lamine@example.com');
    await user.type(screen.getByLabelText(/pays/i), 'Mali');
    await user.type(screen.getByLabelText(/sujet/i), 'Demande support');
    await user.type(
      screen.getByLabelText(/message/i),
      'Bonjour, je souhaite obtenir plus d informations sur vos services.'
    );

    const submit = screen.getByRole('button', { name: /envoyer le message/i });
    expect(submit).toBeEnabled();
  });
});
