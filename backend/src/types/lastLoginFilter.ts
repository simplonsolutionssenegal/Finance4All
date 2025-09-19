export type LastLoginFilter =
  | { type: 'recent' }
  | { type: 'last_month' }
  | { type: 'custom_date'; date: Date };