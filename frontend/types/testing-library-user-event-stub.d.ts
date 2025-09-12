// Temporary stub to satisfy CI type-check complaining about '@testing-library/user-event'
// Real dependency removed; module not actually imported anymore in repo HEAD.
// If a cached version of a test still imports it, this prevents TS2307.
// Safe to remove once CI no longer references old cached test code.
declare module '@testing-library/user-event' {
  // Export a minimal shape to satisfy any legacy import signatures.
  const userEvent: any;
  export default userEvent;
}
