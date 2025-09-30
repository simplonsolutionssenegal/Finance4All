import { render, screen, fireEvent } from '@testing-library/react';

import '@testing-library/jest-dom';
import InstituteHeader from '@/components/institutions/InstituteHeaderProps';
import type { InstituteHeaderProps } from '@/models/institute';

describe('InstituteHeader', () => {
  const baseProps: InstituteHeaderProps = {
    logoSrc: '/logo.png',
    name: 'Institut Test',
    status: 'ACTIF',
    website: 'www.institut-test.com',
    description: 'Une description de test',
    zones: [
      { id: 1, label: 'Zone 1' },
      { id: 2, label: 'Zone 2' },
    ],
  };

  it('affiche le nom, le statut et la description', () => {
    render(<InstituteHeader {...baseProps} />);

    expect(screen.getByText('Institut Test')).toBeInTheDocument();
    expect(screen.getByText('ACTIF')).toBeInTheDocument();
    expect(screen.getByText('Une description de test')).toBeInTheDocument();
  });

  it('affiche le site web avec le bon lien', () => {
    render(<InstituteHeader {...baseProps} />);

    const link = screen.getByRole('link', { name: /www\.institut-test\.com/i });
    expect(link).toHaveAttribute('href', 'https://www.institut-test.com');
  });

  it('affiche toutes les zones', () => {
    render(<InstituteHeader {...baseProps} />);

    expect(screen.getByText('Zone 1')).toBeInTheDocument();
    expect(screen.getByText('Zone 2')).toBeInTheDocument();
  });

  it('supprime une zone lorsqu’on clique sur le bouton X', () => {
    render(<InstituteHeader {...baseProps} />);

    const button = screen.getByRole('button', { name: /Retirer Zone 1/i });
    fireEvent.click(button);

    expect(screen.queryByText('Zone 1')).not.toBeInTheDocument();
    expect(screen.getByText('Zone 2')).toBeInTheDocument();
  });

  it('déclenche les actions sur REJETER et ACTIVER', () => {
    // espionner console.warn (utilisé dans ton composant)
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<InstituteHeader {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'REJETER' }));
    fireEvent.click(screen.getByRole('button', { name: 'ACTIVER' }));

    expect(spy).toHaveBeenCalledWith('REJETER');
    expect(spy).toHaveBeenCalledWith('ACTIVER');

    spy.mockRestore();
  });
});
