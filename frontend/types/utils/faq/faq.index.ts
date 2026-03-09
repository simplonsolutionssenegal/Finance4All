import { ACCOUNT_FAQ } from './faq.account';
import { BILLING_FAQ } from './faq.billing';
import { MODULES_FAQ } from './faq.modules';
import { ORG_FAQ } from './faq.organizations';
import { SECURITY_FAQ } from './faq.security';

export const HELP_FAQ_ITEMS = [
  ...MODULES_FAQ,
  ...ORG_FAQ,
  ...ACCOUNT_FAQ,
  ...BILLING_FAQ,
  ...SECURITY_FAQ,
];
