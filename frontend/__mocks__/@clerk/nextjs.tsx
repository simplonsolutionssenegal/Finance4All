/* eslint-env jest */
/// <reference types="jest" />

import type { ReactNode } from "react";

// Providers / wrappers
export function ClerkProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function SignedIn({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

export function SignedOut({ children }: { children: ReactNode }) {
    return <>{children}</>;
}

// Hooks utilisateur
export const useUser = () => ({
    isSignedIn: false,
    user: null,
});

export const useClerk = () => ({
    openSignIn: jest.fn(),
    openUserProfile: jest.fn(),
});

// Auth côté serveur (mock minimal)
export const auth = async () => ({ userId: null, sessionId: null });
export const currentUser = async () => null;

// Nouveaux mocks pour Organization
export const useOrganization = () => ({
    organization: null,
    membership: null,
});

export const useOrganizationList = () => ({
    isLoaded: true,
    setActive: jest.fn(),
    organizationList: [],
});

// Components
export const SignInButton = ({ children }: { children?: ReactNode }) => (
    <button type="button">{children ?? "Sign in"}</button>
);

export const UserButton = () => <div />;
