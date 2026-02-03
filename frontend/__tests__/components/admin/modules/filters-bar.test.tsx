// __tests__/components/admin/modules/filters-bar.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import FiltersBar from '@/components/admin/modules/filters-bar';

// Mock minimal de lucide-react
jest.mock('lucide-react', () => ({
  Plus: () => <span data-testid='plus-icon'>+</span>,
}));

describe('FiltersBar', () => {
  const onNewClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche les textes par défaut', () => {
    render(<FiltersBar onNewClick={onNewClick} />);

    expect(screen.getByText('Actions rapides')).toBeInTheDocument();
    expect(screen.getByText('Créer un module')).toBeInTheDocument();
    expect(screen.getByText('Nouveau parcours d’apprentissage')).toBeInTheDocument();
  });

  it('affiche les textes personnalisés passés en props', () => {
    render(
      <FiltersBar
        onNewClick={onNewClick}
        title='Mes actions'
        primaryText='Créer un quiz'
        secondaryText='Nouveau contenu interactif'
      />
    );

    expect(screen.getByText('Mes actions')).toBeInTheDocument();
    expect(screen.getByText('Créer un quiz')).toBeInTheDocument();
    expect(screen.getByText('Nouveau contenu interactif')).toBeInTheDocument();
  });

  it('appelle onNewClick lors du clic sur le bouton', async () => {
    const user = userEvent.setup();
    render(<FiltersBar onNewClick={onNewClick} />);

    const button = screen.getByRole('button', { name: /créer un module/i });
    await user.click(button);

    expect(onNewClick).toHaveBeenCalledTimes(1);
  });

  it("affiche l'icône plus", () => {
    render(<FiltersBar onNewClick={onNewClick} />);

    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
  });

  it('applique les classes principales au conteneur et au bouton', () => {
    const { container } = render(<FiltersBar onNewClick={onNewClick} />);

    const wrapper = container.querySelector('.space-y-3.mb-2');
    expect(wrapper).toBeInTheDocument();

    const button = container.querySelector('button');
    expect(button).toHaveClass(
      'w-full',
      'md:w-[300px]',
      'flex',
      'items-center',
      'gap-4',
      'p-4',
      'rounded-xl',
      'border',
      'border-blue-200',
      'bg-white',
      'hover:bg-blue-50/40',
      'transition-colors'
    );
  });
});
