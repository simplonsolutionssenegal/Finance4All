export const useSignUp = jest.fn(() => ({
  isLoaded: true,
  signUp: {
    create: jest.fn(),
    prepareEmailAddressVerification: jest.fn(),
    attemptEmailAddressVerification: jest.fn(),
  },
}));

export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
}));

export const ClerkProvider = ({ children }) => children;
export const SignUp = () => <div data-testid='clerk-sign-up'>Sign Up Component</div>;
export const SignIn = () => <div data-testid='clerk-sign-in'>Sign In Component</div>;
