import { render, screen } from '@testing-library/react';

import Login from '@/app/login/page';

jest.mock('@/components/connexion-form', () => ({
  ConnexionForm: () => <div data-testid='connexion-form'>Connexion Form</div>,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />;
  },
}));

describe('Login Page', () => {
  it('renders without crashing', () => {
    render(<Login />);
    expect(screen.getByTestId('connexion-form')).toBeInTheDocument();
  });

  it('displays the main title', () => {
    render(<Login />);
    expect(screen.getByText('Connextez-vous à votre espace de formation')).toBeInTheDocument();
  });
});
