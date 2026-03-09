import { render, screen } from '@testing-library/react';

import ContactCards from '@/components/public/contact/contact-cards';

describe('ContactCards', () => {
  it('renders contact mode cards and details', () => {
    render(<ContactCards mode='contact' />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Téléphone')).toBeInTheDocument();
    expect(screen.getByText('Bureaux')).toBeInTheDocument();
    expect(screen.getByText('Horaires')).toBeInTheDocument();
    expect(screen.getByText('support@finance4all.com')).toBeInTheDocument();
  });

  it('uses gray text style for contact mode details', () => {
    render(<ContactCards mode='contact' />);

    const detail = screen.getByText('Dakar, Sénégal');
    const detailContainer = detail.closest('.text-gray-500');
    expect(detail.tagName).toBe('SPAN');
    expect(detailContainer).toHaveClass('text-gray-500');
  });
});
