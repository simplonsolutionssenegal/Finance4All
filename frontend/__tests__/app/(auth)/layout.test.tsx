// __tests__/app/(auth)/layout.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthLayout from '@/app/(auth)/layout';

// On mocke Header et SideNav pour éviter leurs dépendances internes
jest.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <header data-testid="header-mock">HEADER</header>,
}));

jest.mock('@/components/sidenav', () => ({
  __esModule: true,
  default: () => <nav data-testid="sidenav-mock">SIDENAV</nav>,
}));

const Child = () => <div data-testid="content">Hello</div>;

describe('AuthLayout', () => {
  it('rend le header, la sidebar et le main avec les classes attendues', () => {
    const { container } = render(
      <AuthLayout>
        <Child />
      </AuthLayout>
    );

    // racine
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass('flex', 'h-screen', 'flex-col');

    // header mocké présent
    expect(screen.getByTestId('header-mock')).toBeInTheDocument();

    // conteneur (ligne) qui contient sidebar + main
    // c'est le 2e enfant direct de la racine
    const row = root.children[1] as HTMLElement;
    expect(row).toHaveClass('flex', 'flex-1', 'overflow-hidden', 'm-2');

    // sidenav mockée dans un conteneur avec classes de largeur
    const sidenavContainer = row.children[0] as HTMLElement;
    expect(sidenavContainer).toHaveClass('w-full', 'flex-none', 'md:w-64');
    expect(screen.getByTestId('sidenav-mock')).toBeInTheDocument();

    // main
    const main = row.children[1] as HTMLElement;
    expect(main.tagName.toLowerCase()).toBe('main');
    expect(main).toHaveClass('flex-1', 'overflow-y-auto', 'p-2');

    // children rendus
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  it('supporte des children vides', () => {
    const { container } = render(<AuthLayout>{null}</AuthLayout>);
    const main = container.querySelector('main')!;
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('flex-1', 'overflow-y-auto', 'p-2');
  });

  it('est une fonction qui renvoie du JSX', () => {
    expect(typeof AuthLayout).toBe('function');
    const view = render(<AuthLayout><Child /></AuthLayout>);
    expect(view.container).toBeTruthy();
  });
});
