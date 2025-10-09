import { fireEvent, render, screen } from '@testing-library/react';

import ConfirmUpdateStatusModal from '@/components/admin/institutions/ConfirmUpdateStatusModal';
import { useUpdateInstitutionStatus } from '@/hooks/institution/useUpdateInstitutionStatus';
import { InstitutionStatus, type Institution } from '@/types/Institution';

// Mock the hook
jest.mock('@/hooks/institution/useUpdateInstitutionStatus');

const mockUseUpdateInstitutionStatus = useUpdateInstitutionStatus as jest.Mock;

describe('ConfirmUpdateStatusModal', () => {
  const mockOnClose = jest.fn();
  const mockRefresh = jest.fn();
  const mockActivateInstitution = jest.fn();
  const mockDeactivateInstitution = jest.fn();

  const institution: Institution = {
    id: 'inst-123',
    name: 'Test Institution',
    description: 'Inscription description',
    website: '',
    geographicZones: [],
    status: InstitutionStatus.INACTIVE,
    logoUrl: '',
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    mockUseUpdateInstitutionStatus.mockReturnValue({
      activateInstitution: mockActivateInstitution,
      deactivateInstitution: mockDeactivateInstitution,
    });
  });

  it('should not be visible when isOpen is false', () => {
    render(
      <ConfirmUpdateStatusModal
        isOpen={false}
        onClose={mockOnClose}
        refresh={mockRefresh}
        institution={institution}
        status={InstitutionStatus.ACTIVE}
      />
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  describe('when activating an institution', () => {
    beforeEach(() => {
      render(
        <ConfirmUpdateStatusModal
          isOpen
          onClose={mockOnClose}
          refresh={mockRefresh}
          institution={institution}
          status={InstitutionStatus.ACTIVE}
        />
      );
    });

    it('should render the modal with activation content', () => {
      expect(screen.getByRole('heading', { name: 'Attention' })).toBeInTheDocument();
      const description = screen.getByText((content, element) => {
        const hasText = (node: Element) =>
          node.textContent === `Vous allez activer l'institution ${institution.name}`;
        const elementHasText = hasText(element!);
        const childrenDontHaveText = Array.from(element!.children).every(
          child => !hasText(child as Element)
        );
        return elementHasText && childrenDontHaveText;
      });
      expect(description).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Activer' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
    });

    it('should call activateInstitution on confirm', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Activer' }));
      expect(mockActivateInstitution).toHaveBeenCalledWith('inst-123');
    });
  });

  describe('when deactivating an institution', () => {
    beforeEach(() => {
      render(
        <ConfirmUpdateStatusModal
          isOpen
          onClose={mockOnClose}
          refresh={mockRefresh}
          institution={institution}
          status={InstitutionStatus.INACTIVE}
        />
      );
    });

    it('should render the modal with deactivation content', () => {
      expect(screen.getByRole('heading', { name: 'Attention' })).toBeInTheDocument();
      const description = screen.getByText((content, element) => {
        const hasText = (node: Element) =>
          node.textContent === `Vous allez désactiver l'institution ${institution.name}`;
        const elementHasText = hasText(element!);
        const childrenDontHaveText = Array.from(element!.children).every(
          child => !hasText(child as Element)
        );
        return elementHasText && childrenDontHaveText;
      });
      expect(description).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Désactiver' })).toBeInTheDocument();
    });

    it('should call deactivateInstitution on confirm', () => {
      fireEvent.click(screen.getByRole('button', { name: 'Désactiver' }));
      expect(mockDeactivateInstitution).toHaveBeenCalledWith('inst-123');
    });
  });

  it('should call onClose when the cancel button is clicked', () => {
    render(
      <ConfirmUpdateStatusModal
        isOpen
        onClose={mockOnClose}
        refresh={mockRefresh}
        institution={institution}
        status={InstitutionStatus.ACTIVE}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose and refresh on successful mutation', () => {
    let onSuccessCallback = () => {};
    mockUseUpdateInstitutionStatus.mockImplementation(({ onSuccess }) => {
      onSuccessCallback = onSuccess;
      return {
        activateInstitution: mockActivateInstitution,
        deactivateInstitution: mockDeactivateInstitution,
      };
    });

    render(
      <ConfirmUpdateStatusModal
        isOpen
        onClose={mockOnClose}
        refresh={mockRefresh}
        institution={institution}
        status={InstitutionStatus.ACTIVE}
      />
    );

    // Simulate a successful mutation by calling the onSuccess callback
    onSuccessCallback();

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
