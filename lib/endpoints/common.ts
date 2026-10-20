import type { ResponseCase } from './types';

// Responses that many endpoints share. Reuse these so the wording and the
// "what the app should do" advice stay identical everywhere.

export const unauthorized: ResponseCase = {
  id: 'unauthorized',
  status: 401,
  label: 'Not signed in',
  when: 'The access token is missing, malformed or expired (access tokens last 15 minutes).',
  ui: 'Call Refresh tokens once, then retry the request. If refresh also fails, send the user to the welcome screen.',
  body: { error: 'Invalid or expired token' },
};

export const ownerOnly: ResponseCase = {
  id: 'forbidden',
  status: 403,
  label: 'Owners only',
  when: 'The signed-in user is a sales rep, and this action is for the business owner.',
  ui: 'Hide this feature for sales reps. If they still reach it, show “Only the business owner can do this.”',
  body: { error: 'Insufficient permissions' },
};

export const paymentsNotSetUp: ResponseCase = {
  id: 'not-set-up',
  status: 409,
  label: 'Payments not set up',
  when: 'The business has no payment account yet (its creation failed at sign-up).',
  ui: 'Send the owner to payment setup. Sales reps: “Ask the business owner to finish payment setup.”',
  body: {
    error: 'Payments are not set up for this business yet. Complete payment setup first.',
    code: 'PAYMENTS_NOT_SET_UP',
  },
};

export const validation = (path: string, msg: string, value: unknown = ''): ResponseCase => ({
  id: 'validation',
  status: 400,
  label: 'Invalid input',
  when: 'One or more fields failed validation.',
  ui: 'Show each errors[].msg under the field named in errors[].path. Don’t clear the form.',
  body: { errors: [{ type: 'field', value, msg, path, location: 'body' }] },
});

export const serverError = (error: string): ResponseCase => ({
  id: 'server',
  status: 500,
  label: 'Server error',
  when: 'Something unexpected failed on the server.',
  ui: 'Show “Something went wrong. Please try again.” and let the user retry. If it keeps happening, report it to Danny.',
  body: { error },
});

export const providerDown = (error: string): ResponseCase => ({
  id: 'provider-down',
  status: 502,
  label: 'Payment provider unavailable',
  when: 'Our payment provider (Bachs) did not respond properly.',
  ui: 'Show “Payments are temporarily unavailable. Please try again in a moment.” and offer a retry button.',
  body: { error },
});

// ─── Realistic sample objects, reused in examples ────────────────
export const SAMPLE_USER = {
  id: '6948ee72-077d-4def-9b39-24947e29ee17',
  firstName: 'Ada',
  lastName: 'Obi',
  email: 'ada@example.com',
  phoneNumber: '+2348012345678',
};

export const SAMPLE_BUSINESS_ID = 'd6a5ca8f-c7fb-49a1-8a36-b406df19a821';
export const SAMPLE_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTQ4…';
export const SAMPLE_REFRESH_TOKEN = '99ad24f2-471c-4dbe-81e2-15ba850a732e-5d2e45f1…';

export const SAMPLE_SALE = {
  id: 'f9d46d44-30b2-499d-92c1-0473fad6b1e3',
  description: 'Two bags of rice',
  createdAt: '2026-10-19T20:02:26.588Z',
  amount: '5000.00',
  initiatorId: SAMPLE_USER.id,
  paymentType: 'bank_transfer',
  amountPaid: null as string | null,
  businessId: SAMPLE_BUSINESS_ID,
  status: 'pending',
  expiresAt: '2026-10-19T20:32:28.232Z',
  currency: 'NGN',
  provider: 'bachs',
  bachsCheckoutId: 'chk_SCK5M7uhZkDcGFeD',
  bachsPaymentId: null as string | null,
  checkoutUrl: 'https://checkout.bachs.io/c/0vy93E1qqE2X0Sg',
};

export const QR_PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQ…';
