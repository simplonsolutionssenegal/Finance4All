// Extending Express Request to include user property
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}
