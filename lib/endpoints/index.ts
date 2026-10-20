import type { Endpoint, Group } from './types';
import { auth } from './auth';
import { onboarding } from './onboarding';
import { paymentSetup } from './payment-setup';
import { sales } from './sales';
import { balances } from './balances';
import { payoutDestinations } from './payout-destinations';
import { withdrawals } from './withdrawals';
import { businesses, devices, staff } from './team';

export const GROUPS: Group[] = [
  { id: 'auth', title: 'Auth', description: 'Passwordless sign-in with a one-time code, token refresh and logout.' },
  { id: 'onboarding', title: 'Onboarding', description: 'Create the user profile and the business, and invite sales reps.' },
  { id: 'payment-setup', title: 'Payment setup', description: 'Verify the business so it can accept and withdraw money.' },
  { id: 'sales', title: 'Sales', description: 'Create a sale, show the QR code, and track it until it is paid.' },
  { id: 'balances', title: 'Balances', description: 'What the business has available and what is still settling.' },
  { id: 'payout-destinations', title: 'Payout destinations', description: 'Bank accounts and crypto wallets the business withdraws to.' },
  { id: 'withdrawals', title: 'Withdrawals', description: 'Send money out to a bank account or a crypto wallet.' },
  { id: 'staff', title: 'Staff', description: 'See and remove the sales reps on a business.' },
  { id: 'business', title: 'Businesses', description: 'List and switch between businesses a user belongs to.' },
  { id: 'devices', title: 'Devices', description: 'Register phones and browsers for push notifications.' },
];

export const ENDPOINTS: Endpoint[] = [
  ...auth,
  ...onboarding,
  ...paymentSetup,
  ...sales,
  ...balances,
  ...payoutDestinations,
  ...withdrawals,
  ...staff,
  ...businesses,
  ...devices,
];

export const getEndpoint = (slug: string) => ENDPOINTS.find((e) => e.slug === slug);
export const endpointsIn = (groupId: string) => ENDPOINTS.filter((e) => e.group === groupId);

/** Previous / next endpoint in sidebar order, for the footer links */
export function neighbours(slug: string) {
  const i = ENDPOINTS.findIndex((e) => e.slug === slug);
  return { prev: i > 0 ? ENDPOINTS[i - 1] : undefined, next: i >= 0 ? ENDPOINTS[i + 1] : undefined };
}
