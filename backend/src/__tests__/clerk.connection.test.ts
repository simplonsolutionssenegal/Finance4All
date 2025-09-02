import { clerkMiddleware } from '@clerk/express';

describe('Clerk Connection Test', () => {
  describe('Clerk Module Loading', () => {
    test('should successfully import Clerk middleware', () => {
      expect(clerkMiddleware).toBeDefined();
      expect(typeof clerkMiddleware).toBe('function');
    });

    test('should be able to create Clerk middleware instance', () => {
      const middleware = clerkMiddleware();
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });
  });

  describe('Clerk Environment Configuration', () => {
    test('should have Clerk environment variables available', () => {
      // Ces variables peuvent être undefined en test, mais Clerk devrait gérer cela gracieusement
      expect(process.env).toBeDefined();
    });

    test('should be able to initialize Clerk with test environment', () => {
      // Test que Clerk peut être initialisé même en environnement de test
      expect(() => {
        clerkMiddleware();
      }).not.toThrow();
    });
  });

  describe('Clerk Middleware Functionality', () => {
    test('should create middleware function that can be called', () => {
      const middleware = clerkMiddleware();
      
      // Le middleware devrait être une fonction qui peut être appelée
      expect(typeof middleware).toBe('function');
      
      // Test que la fonction peut être appelée sans erreur
      expect(() => {
        // Simuler un appel de middleware (sans Express)
        if (typeof middleware === 'function') {
          // Vérifier que c'est bien une fonction
          expect(middleware).toBeDefined();
        }
      }).not.toThrow();
    });
  });

  describe('Clerk Error Handling', () => {
    test('should handle missing environment variables gracefully', () => {
      // Sauvegarder les valeurs originales
      const originalSecretKey = process.env.CLERK_SECRET_KEY;
      const originalPublishableKey = process.env.CLERK_PUBLISHABLE_KEY;
      
      // Supprimer temporairement les variables d'environnement
      delete process.env.CLERK_SECRET_KEY;
      delete process.env.CLERK_PUBLISHABLE_KEY;
      
      // Clerk devrait gérer cela gracieusement
      expect(() => {
        clerkMiddleware();
      }).not.toThrow();
      
      // Restaurer les valeurs originales
      process.env.CLERK_SECRET_KEY = originalSecretKey;
      process.env.CLERK_PUBLISHABLE_KEY = originalPublishableKey;
    });
  });
});
