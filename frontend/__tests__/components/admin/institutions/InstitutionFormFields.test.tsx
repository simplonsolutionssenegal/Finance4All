import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

import { InstitutionFormFields } from '@/components/admin/institutions/shared/InstitutionFormFields';
import { Form } from '@/components/ui/form';
import type { InstitutionFormData } from '@/components/admin/institutions/shared/InstitutionFormSchema';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }: any) => (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid='next-image'
    />
  ),
}));

const TestForm: React.FC<{
  defaultValues?: Partial<InstitutionFormData>;
  variant?: 'default' | 'compact';
  disabled?: boolean;
  step?: number;
}> = ({ defaultValues = {}, variant = 'compact', disabled = false, step }) => {
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
        step={step}
      />
    </Form>
  );
};

describe('InstitutionFormFields (interactive)', () => {
  describe('Compact variant sans étapes (EditInstitutionModal)', () => {
    it('renders all fields in compact variant without step', async () => {
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
    });

    it('displays logo preview when logoUrl is valid', async () => {
      render(
        <TestForm defaultValues={{ logoUrl: 'https://example.com/logo.png' }} variant='compact' />
      );

      const img = await screen.findByAltText('Aperçu du logo');
      expect(img).toBeInTheDocument();
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
        name: /Sélectionner un pays/i,
      });
      await userEvent.click(paysTrigger);
      const senegalItem = await screen.findByText(/Sénégal/i);
      await userEvent.click(senegalItem);
      expect(screen.getByRole('button', { name: /Sénégal/i })).toBeInTheDocument();
    });
  });

  describe('Compact variant avec étapes (InstitutionModal)', () => {
    it('renders only step 1 fields when step=1', () => {
      render(<TestForm variant='compact' step={1} />);

      // Step 1 fields
      expect(screen.getByPlaceholderText('Ex: Orange Money')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Banque/i })).toBeInTheDocument();

      // Step 2 fields should NOT be present
      expect(screen.queryByPlaceholderText('https://example.com/logo.png')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Description de l'institution")).not.toBeInTheDocument();

      // Step 3 fields should NOT be present
      expect(screen.queryByPlaceholderText('Ex: Dakar, Thiès...')).not.toBeInTheDocument();
    });

    it('renders only step 2 fields when step=2', () => {
      render(<TestForm variant='compact' step={2} />);

      // Step 2 fields
      expect(screen.getByPlaceholderText('https://example.com/logo.png')).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Description de l'institution")).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://www.example.com')).toBeInTheDocument();

      // Step 1 fields should NOT be present
      expect(screen.queryByPlaceholderText('Ex: Orange Money')).not.toBeInTheDocument();

      // Step 3 fields should NOT be present
      expect(screen.queryByPlaceholderText('Ex: Dakar, Thiès...')).not.toBeInTheDocument();
    });

    it('renders only step 3 fields when step=3', () => {
      render(<TestForm variant='compact' step={3} />);

      // Step 3 fields
      expect(screen.getByPlaceholderText('Ex: Dakar, Thiès...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sélectionner un pays/i })).toBeInTheDocument();

      // Step 1 fields should NOT be present
      expect(screen.queryByPlaceholderText('Ex: Orange Money')).not.toBeInTheDocument();

      // Step 2 fields should NOT be present
      expect(screen.queryByPlaceholderText('https://example.com/logo.png')).not.toBeInTheDocument();
    });

    it('displays logo preview in step 2 when logoUrl is valid', async () => {
      render(
        <TestForm
          defaultValues={{ logoUrl: 'https://example.com/logo.png' }}
          variant='compact'
          step={2}
        />
      );

      const img = await screen.findByAltText('Aperçu du logo');
      expect(img).toBeInTheDocument();
    });

    it('allows adding zones in step 3', async () => {
      render(<TestForm variant='compact' step={3} />);

      const addButton = screen.getByRole('button', { name: /Ajouter/i });
      await userEvent.click(addButton);

      const euroButton = await screen.findByRole('button', { name: /EURO/i });
      await userEvent.click(euroButton);

      const badge = await screen.findByText('EURO');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Default variant', () => {
    it('renders default variant and shows default labels', async () => {
      render(<TestForm variant='default' />);
      // Default variant includes a different logo label
      expect(screen.getByText(/Logo \(emoji ou URL\)/i)).toBeInTheDocument();
      // Zones placeholder for default
      expect(screen.getByPlaceholderText(/Sélectionner une zone/i)).toBeInTheDocument();
    });

    it('displays logo preview in default variant', async () => {
      render(
        <TestForm defaultValues={{ logoUrl: 'https://example.com/logo.png' }} variant='default' />
      );

      const img = await screen.findByAltText('Aperçu du logo');
      expect(img).toBeInTheDocument();
    });
  });

  describe('Common behaviors', () => {
    it('honors disabled prop (fields and buttons are disabled)', async () => {
      render(<TestForm variant='compact' disabled={true} />);
      const nameInput = screen.getByPlaceholderText('Ex: Orange Money');
      expect(nameInput).toBeDisabled();
      const addButton = screen.getByRole('button', { name: /Ajouter/i });
      expect(addButton).toBeDisabled();
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
      await userEvent.click(document.body);
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

    it('allows removing zones by clicking on badge', async () => {
      render(
        <TestForm variant='compact' defaultValues={{ geographicZones: ['UEMOA', 'CEMAC'] }} />
      );

      expect(screen.getByText('UEMOA')).toBeInTheDocument();
      expect(screen.getByText('CEMAC')).toBeInTheDocument();

      await userEvent.click(screen.getByText('UEMOA'));

      await waitFor(() => {
        expect(screen.queryByText('UEMOA')).not.toBeInTheDocument();
      });

      // CEMAC should still be present
      expect(screen.getByText('CEMAC')).toBeInTheDocument();
    });
  });

  describe('Step-specific behaviors', () => {
    it('type selection works in step 1', async () => {
      render(<TestForm variant='compact' step={1} />);

      const typeTrigger = screen.getByRole('button', { name: /Banque/i });
      await userEvent.click(typeTrigger);

      const paiementItem = await screen.findByText(/Service de paiement/i);
      await userEvent.click(paiementItem);

      expect(screen.getByRole('button', { name: /Service de paiement/i })).toBeInTheDocument();
    });

    it('description input works in step 2', async () => {
      render(<TestForm variant='compact' step={2} />);

      const descInput = screen.getByPlaceholderText("Description de l'institution");
      await userEvent.type(descInput, 'Une belle description');

      expect((descInput as HTMLTextAreaElement).value).toBe('Une belle description');
    });

    it('country selection works in step 3', async () => {
      render(<TestForm variant='compact' step={3} />);

      const paysTrigger = screen.getByRole('button', { name: /Sélectionner un pays/i });
      await userEvent.click(paysTrigger);

      const camerounItem = await screen.findByText(/Cameroun/i);
      await userEvent.click(camerounItem);

      expect(screen.getByRole('button', { name: /Cameroun/i })).toBeInTheDocument();
    });
  });
});
