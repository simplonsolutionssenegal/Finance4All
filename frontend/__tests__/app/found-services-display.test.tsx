import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the ServicesDashboard to avoid rendering heavy client components
jest.mock('@/components/services-financiers/ServicesDashboard', () => ({
  ServicesDashboard: () => <div>MockServicesDashboard</div>,
}));

// Import the page (server component) that includes the dashboard
import FoundServicesDisplay from '@/app/(public)/comparator/found-services-display/page';

describe('FoundServicesDisplay page', () => {
  it('renders the services dashboard wrapper', () => {
    render(<FoundServicesDisplay />);

    expect(screen.getByText('MockServicesDashboard')).toBeInTheDocument();
  });
});
