// Every push the backend sends, mirrored from controller/bachsWebhook.ts.

export interface PushType {
  type: string;
  title: string;
  body: string;
  data: Record<string, string>;
  /** Who receives it */
  audience: string;
  /** Where tapping it should take the user */
  route: string;
  /** What triggers it, in plain words */
  trigger: string;
}

export const PUSH_TYPES: PushType[] = [
  {
    type: 'sale.confirmed',
    title: 'Payment received · ₦5,000',
    body: 'Two bags of rice',
    data: { type: 'sale.confirmed', saleId: 'f9d46d44-30b2-499d-92c1-0473fad6b1e3' },
    audience: 'The sales rep who created the sale, and the owner(s)',
    route: 'Sale detail. If that sale’s QR screen is open, flip it to “Paid ✓”.',
    trigger: 'A customer paid a sale in full. The body is the sale description, or “A customer just paid.”',
  },
  {
    type: 'sale.underpaid',
    title: 'Partial payment · ₦3,000 of ₦5,000',
    body: '₦2,000 still outstanding.',
    data: { type: 'sale.underpaid', saleId: 'f9d46d44-30b2-499d-92c1-0473fad6b1e3' },
    audience: 'The sales rep who created the sale, and the owner(s)',
    route: 'Sale detail',
    trigger: 'A customer paid less than the amount.',
  },
  {
    type: 'sale.expired',
    title: 'Payment link expired · ₦5,000',
    body: 'The customer did not pay in time. Create a new sale to try again.',
    data: { type: 'sale.expired', saleId: 'f9d46d44-30b2-499d-92c1-0473fad6b1e3' },
    audience: 'Only the sales rep who created the sale',
    route: 'Sale detail, with a “Create new sale” button',
    trigger: 'The checkout closed without payment (after 30 minutes).',
  },
  {
    type: 'withdrawal.completed',
    title: 'Withdrawal completed · ₦2,000',
    body: 'The money is on its way to your account.',
    data: { type: 'withdrawal.completed', withdrawalId: '611ef09f-88b7-4841-a22a-12a840ff1087' },
    audience: 'Owner(s)',
    route: 'Withdrawal detail',
    trigger: 'A bank or crypto withdrawal reached its destination. Crypto shows e.g. “2.62 USDT”.',
  },
  {
    type: 'withdrawal.failed',
    title: 'Withdrawal failed · ₦2,000',
    body: 'Open the app to see why and try again.',
    data: { type: 'withdrawal.failed', withdrawalId: '611ef09f-88b7-4841-a22a-12a840ff1087' },
    audience: 'Owner(s)',
    route: 'Withdrawal detail',
    trigger: 'The bank or network rejected a withdrawal.',
  },
  {
    type: 'account.active',
    title: 'You can now accept payments',
    body: 'Your account has been verified. Start selling!',
    data: { type: 'account.active' },
    audience: 'Owner(s)',
    route: 'Home / dashboard',
    trigger: 'Verification finished and payments were enabled.',
  },
  {
    type: 'test',
    title: 'UnioGate test 🎉',
    body: 'Push notifications are working.',
    data: { type: 'test' },
    audience: 'The user who called Send a test push',
    route: 'Nowhere (ignore)',
    trigger: 'POST /devices/test, on development servers only.',
  },
];
