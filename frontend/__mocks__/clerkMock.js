export const useClerk = () => ({ session: {} });
// Mock client-side Clerk SDK used dans tes composants/hooks React
const noop = () => {};
const promiseNoop = async (..._args) => ({});

export const ClerkProvider = ({ children }) => children;
export const SignedIn = ({ children }) => children;
export const SignedOut = ({ children }) => children;

// Hooks courants côté client
export const useAuth = () => ({
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  signOut: jest.fn(),
});

export const useUser = () => ({
  isLoaded: true,
  user: null,
});

export const useSignIn = () => ({
  signIn: jest.fn(),
  setActive: jest.fn(),
});

export const useSignUp = () => ({
  isLoaded: true,
  signUp: {
    create: jest.fn(promiseNoop),
    prepareEmailAddressVerification: jest.fn(promiseNoop),
    attemptEmailAddressVerification: jest.fn(promiseNoop),
  },
});

// Composants fréquemment importés
export const RedirectToSignIn = noop;
export const RedirectToSignUp = noop;
export const SignIn = noop;
export const SignUp = noop;

export default {};
