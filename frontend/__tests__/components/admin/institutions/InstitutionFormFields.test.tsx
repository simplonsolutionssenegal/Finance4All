import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { InstitutionFormFields } from '@/components/admin/institutions/shared/InstitutionFormFields';
import { Form } from '@/components/ui/form';
import type { InstitutionFormData } from '@/components/admin/institutions/shared/InstitutionFormSchema';

const TestForm: React.FC<{
  defaultValues?: Partial<InstitutionFormData>;
  variant?: 'default' | 'compact';
  disabled?: boolean;
}> = ({ defaultValues = {}, variant = 'compact', disabled = false }) => {
  const methods = useForm<InstitutionFormData>({
    defaultValues: {
      name: '',
      description: '',
      website: '',
      geographicZones: [],
      logoUrl: '',
      type: undefined,
      pays: undefined,
      ...defaultValues,
    } as InstitutionFormData,
    mode: 'onChange',
  });

  return (
    <Form {...methods}>
      <InstitutionFormFields
        control={methods.control}
        watch={methods.watch}
        errors={methods.formState.errors}
        variant={variant}
        disabled={disabled}
      />
    </Form>
  );
};

describe('InstitutionFormFields (interactive)', () => {
  it('renders compact variant and allows adding/removing zones and displays logo preview', async () => {
    render(<TestForm variant='compact' />);

    // Name input exists
    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    expect(nameInput).toBeInTheDocument();

    await userEvent.type(nameInput, 'Orange Money');
    expect((nameInput as HTMLInputElement).value).toBe('Orange Money');

    // Open zones dropdown by clicking 'Ajouter'
    const addButton = screen.getByRole('button', { name: /Ajouter/i });
    await userEvent.click(addButton);

    // Select a zone from the list
    const zoneButton = await screen.findByRole('button', { name: /EURO/i });
    await userEvent.click(zoneButton);

    // Badge should appear
    const badge = await screen.findByText('EURO');
    expect(badge).toBeInTheDocument();

    // Clicking the badge removes it
    await userEvent.click(badge);
    await waitFor(() => expect(screen.queryByText('EURO')).not.toBeInTheDocument());

    // Logo preview: set value via form control
    // To access the form methods we render another wrapper with initial logo url and re-render
    render(
      <TestForm defaultValues={{ logoUrl: 'https://example.com/logo.png' }} variant='compact' />
    );

    const img = await screen.findByAltText('Aperçu du logo');
    expect(img).toBeInTheDocument();
  });

  it('renders default variant and shows default labels', async () => {
    render(<TestForm variant='default' />);
    // Default variant includes a different logo label
    expect(screen.getByText(/Logo \(emoji ou URL\)/i)).toBeInTheDocument();
    // Zones placeholder for default
    expect(screen.getByPlaceholderText(/Sélectionner une zone/i)).toBeInTheDocument();
  });

  it('honors disabled prop (fields and buttons are disabled)', async () => {
    render(<TestForm variant='compact' disabled={true} />);
    const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
    expect(nameInput).toBeDisabled();
    const addButton = screen.getByRole('button', { name: /Ajouter/i });
    expect(addButton).toBeDisabled();
  });

  it('allows selecting type and pays in compact variant', async () => {
    render(<TestForm variant='compact' />);

    // Select type
    const typeTrigger = screen.getByRole('button', { name: /Banque/i });
    await userEvent.click(typeTrigger);
    const banqueNumItem = await screen.findByText(/Banque numérique/i);
    await userEvent.click(banqueNumItem);
    // Now the trigger should display the selected label
    expect(screen.getByRole('button', { name: /Banque numérique/i })).toBeInTheDocument();

    // Select pays
    const paysTrigger = screen.getByRole('button', {
      name: /Sélectionner un pays|Sélectionner un pays/i,
    });
    await userEvent.click(paysTrigger);
    const senegalItem = await screen.findByText(/Sénégal/i);
    await userEvent.click(senegalItem);
    expect(screen.getByRole('button', { name: /Sénégal/i })).toBeInTheDocument();
  });

  it('filters zones and shows no-results message', async () => {
    render(<TestForm variant='compact' />);
    const searchInput = screen.getByPlaceholderText('Ex: Dakar, Thiès...');
    await userEvent.type(searchInput, 'ZZZ');
    // Since typing opens the dropdown in compact variant, wait for message
    const noResults = await screen.findByText(/Aucune zone trouvée/i);
    expect(noResults).toBeInTheDocument();
  });

  it('closes dropdown on outside click', async () => {
    render(<TestForm variant='compact' />);
    const addButton = screen.getByRole('button', { name: /Ajouter/i });
    await userEvent.click(addButton);
    // Menu should show at least one zone
    await screen.findByRole('button', { name: /EURO/i });
    // Click outside
    userEvent.click(document.body);
    // EURO should no longer be present
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /EURO/i })).not.toBeInTheDocument()
    );
  });

  it('does not render logo preview when there is a logoUrl error', async () => {
    // Render inside a component so hooks are valid and provide Form context
    const WithMethods: React.FC = () => {
      const methods = useForm<InstitutionFormData>({
        defaultValues: { logoUrl: 'https://example.com/logo.png' } as any,
      });
      return (
        <Form {...methods}>
          <InstitutionFormFields
            control={methods.control}
            watch={methods.watch}
            // simulate an error on logoUrl
            errors={{ logoUrl: { message: 'Invalid URL' } } as any}
            variant='compact'
          />
        </Form>
      );
    };

    render(<WithMethods />);

    expect(screen.queryByAltText('Aperçu du logo')).not.toBeInTheDocument();
  });
});
