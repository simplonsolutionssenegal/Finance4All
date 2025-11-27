import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useForm, FormProvider } from 'react-hook-form';
import NumericFormField from '@/components/admin/institutions/NumericFormField';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';

// Composant wrapper pour tester NumericFormField avec react-hook-form
const TestWrapper = ({
  defaultValues = {},
  name = 'testField',
  label = 'Test Label',
  ...props
}: {
  defaultValues?: { [key: string]: any };
  name?: string;
  label?: string;
  [key: string]: any;
}) => {
  const methods = useForm({ defaultValues });
  return (
    <FormProvider {...methods}>
      <form>
        <NumericFormField control={methods.control} name={name} label={label} {...props} />
      </form>
    </FormProvider>
  );
};

describe('NumericFormField', () => {
  describe('Rendu de base', () => {
    it('affiche le label et le champ de saisie', () => {
      render(<TestWrapper name='testField' label='Test Label' />);
      expect(screen.getByLabelText(/Test Label/)).toBeInTheDocument();
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });

    it('affiche une astérisque quand requiredMark est true', () => {
      render(<TestWrapper name='testField' label='Test Label' requiredMark />);
      const label = screen.getByText(/Test Label/);
      expect(label).toHaveTextContent(/\*/);
    });

    it('affiche le placeholder par défaut', () => {
      render(<TestWrapper name='testField' label='Test Label' />);
      expect(screen.getByPlaceholderText('0')).toBeInTheDocument();
    });

    it('affiche un placeholder personnalisé', () => {
      render(<TestWrapper name='testField' label='Test Label' placeholder='Entrer un nombre' />);
      expect(screen.getByPlaceholderText('Entrer un nombre')).toBeInTheDocument();
    });
  });

  describe('Validation des entrées', () => {
    it('accepte les nombres valides', () => {
      render(<TestWrapper name='testField' label='Test Label' />);
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '42' } });
      expect(input).toHaveValue(42);
    });

    it('empêche la saisie de caractères invalides', () => {
      render(<TestWrapper name='testField' label='Test Label' />);
      const input = screen.getByRole('spinbutton');
      const initialValue = '42';

      // D'abord, définir une valeur initiale
      fireEvent.change(input, { target: { value: initialValue } });

      // Tester les touches invalides
      ['e', 'E', '+', '-'].forEach(key => {
        // Simuler la frappe de touche
        const keyDownEvent = new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true,
        });

        const preventDefaultSpy = jest.spyOn(keyDownEvent, 'preventDefault');
        input.dispatchEvent(keyDownEvent);

        // Vérifier que preventDefault a été appelé
        expect(preventDefaultSpy).toHaveBeenCalled();
        preventDefaultSpy.mockRestore();

        // Vérifier que la valeur n'a pas changé
        expect(input).toHaveValue(Number(initialValue));
      });
    });

    it('accepte les valeurs dans les limites min/max', () => {
      render(<TestWrapper name='testField' label='Test Label' min={0} max={100} />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '50' } });
      expect(input).toHaveValue(50);
    });
  });

  describe('Props et styles', () => {
    it('applique la classe CSS de conteneur personnalisée', () => {
      const { container } = render(
        <TestWrapper name='testField' label='Test Label' containerClassName='custom-container' />
      );
      expect(container.querySelector('.custom-container')).toBeInTheDocument();
    });

    it("applique la classe CSS d'input personnalisée", () => {
      render(<TestWrapper name='testField' label='Test Label' inputClassName='custom-input' />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveClass('custom-input');
    });

    it('désactive le champ quand disabled est true', () => {
      render(<TestWrapper name='testField' label='Test Label' disabled />);
      expect(screen.getByRole('spinbutton')).toBeDisabled();
    });

    it('applique le step spécifié', () => {
      render(<TestWrapper name='testField' label='Test Label' step='0.5' />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('step', '0.5');
    });
  });

  describe('Gestion des valeurs', () => {
    it('convertit une chaîne vide en undefined', () => {
      render(<TestWrapper name='testField' label='Test Label' />);
      const input = screen.getByRole('spinbutton');

      fireEvent.change(input, { target: { value: '' } });
      expect(input).toHaveValue(null);
    });

    it('gère les valeurs par défaut', () => {
      render(
        <TestWrapper name='testField' label='Test Label' defaultValues={{ testField: 123 }} />
      );
      expect(screen.getByRole('spinbutton')).toHaveValue(123);
    });
  });

  describe('Validation et erreurs', () => {
    it("affiche le conteneur de message d'erreur", async () => {
      const { container } = render(
        <TestWrapper
          name='testField'
          label='Test Label'
          defaultValues={{ testField: '' }}
          requiredMark
        />
      );

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      const errorContainer = container.querySelector('.min-h-\\[16px\\]');
      expect(errorContainer).toBeInTheDocument();
    });
  });
});
