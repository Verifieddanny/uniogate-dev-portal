import type { Endpoint } from './types';
import {
  QR_PLACEHOLDER,
  SAMPLE_SALE,
  paymentsNotSetUp,
  providerDown,
  serverError,
  unauthorized,
  validation,
} from './common';

export const sales: Endpoint[] = [
  {
    slug: 'create-sale',
    group: 'sales',
    method: 'POST',
    path: '/sales/create',
    title: 'Create a sale',
    auth: 'user',
    summary:
      'Starts a payment for an amount in naira. You get back a checkout link and a QR code of that link. The customer scans it and pays by bank transfer, card or crypto on a secure page.',
    whenToCall:
      'When a sales rep (or owner) enters an amount and taps “Charge”. Then show the QR full-screen and poll Get a sale until it’s no longer pending.',
    body: [
      { name: 'amount', type: 'number', required: true, description: 'Amount in naira.', example: 5000, rules: 'Greater than 0. Up to 2 decimals.' },
      {
        name: 'paymentType',
        type: 'string',
        required: true,
        description: 'Which payment option the customer sees.',
        example: 'any',
        rules: '"any" (customer chooses: recommended), "bank_transfer", "card" or "crypto".',
      },
      { name: 'description', type: 'string', required: false, description: 'What was sold. Shown in the sale list and the payment notification.', example: 'Two bags of rice', rules: 'Up to 500 characters.' },
    ],
    exampleBody: { amount: 5000, paymentType: 'any', description: 'Two bags of rice' },
    responses: [
      {
        id: 'created',
        status: 201,
        label: 'Sale started',
        when: 'The checkout is ready.',
        ui: 'Show `qrCode` big, the amount, a countdown to `expiresAt`, and a “Share link” button with `checkoutUrl`. Poll Get a sale every 3 seconds.',
        body: {
          message: 'Sale session created',
          sale: {
            id: SAMPLE_SALE.id,
            amount: '5000.00',
            paymentType: 'any',
            status: 'pending',
            checkoutUrl: SAMPLE_SALE.checkoutUrl,
            expiresAt: SAMPLE_SALE.expiresAt,
            description: 'Two bags of rice',
            qrCode: QR_PLACEHOLDER,
          },
        },
      },
      {
        id: 'not-enabled',
        status: 409,
        label: 'Method not enabled',
        when: 'Payments (or this payment type) aren’t enabled yet: verification isn’t finished.',
        ui: 'Owner: “Finish verification to start selling” → Start verification. Rep: “Ask the owner to finish verification.”',
        body: { error: 'This payment method is not enabled yet. Complete payment setup first.', code: 'CAPABILITY_NOT_ACTIVE' },
      },
      paymentsNotSetUp,
      {
        id: 'rejected',
        status: 400,
        label: 'Amount not allowed',
        when: 'The provider refused the amount (e.g. above the single-payment limit).',
        ui: 'Show `error` as-is. It is written for users.',
        body: { error: 'Amount exceeds the maximum of 10000000.00 NGN for a single payment', code: 'VALIDATION_ERROR' },
      },
      validation('amount', 'Amount must be a number greater than 0', -5),
      unauthorized,
      providerDown('Payment provider unavailable, try again'),
      serverError('Failed to create sale'),
    ],
    notes: [
      'qrCode is a ready-to-use PNG data URL: put it straight into an <img src>.',
      'The checkout stays open for 30 minutes. A bank transfer already in progress can still complete after that.',
      'You don’t need to confirm anything: payment confirmation is automatic. There is no “mark as paid” button.',
    ],
  },

  {
    slug: 'get-sale',
    group: 'sales',
    method: 'GET',
    path: '/sales/:id',
    title: 'Get a sale',
    auth: 'user',
    summary: 'Returns one sale and its current status. This is what you poll while the customer pays.',
    whenToCall:
      'Every 3 seconds on the QR screen until status is no longer "pending", and when opening a sale from the list or a notification.',
    pathParams: [{ name: 'id', type: 'string', required: true, description: 'The sale id from Create a sale.', example: SAMPLE_SALE.id }],
    responses: [
      {
        id: 'pending',
        status: 200,
        label: 'Waiting for payment',
        when: 'The customer hasn’t paid yet. `qrCode` is included so you can re-show it.',
        ui: 'Keep showing the QR and keep polling.',
        body: { sale: { ...SAMPLE_SALE, qrCode: QR_PLACEHOLDER } },
      },
      {
        id: 'confirmed',
        status: 200,
        label: 'Paid',
        when: 'Payment received.',
        ui: 'Stop polling. Show a big green “Paid ₦5,000” success screen.',
        body: {
          sale: { ...SAMPLE_SALE, status: 'confirmed', amountPaid: '5000.00', bachsPaymentId: 'ch_6912f40be1a8459fade95dcef4c5725e', qrCode: null },
        },
      },
      {
        id: 'underpaid',
        status: 200,
        label: 'Partly paid',
        when: 'The customer sent less than the amount.',
        ui: 'Show “Received ₦3,000 of ₦5,000”. For crypto they can send the rest; for transfers, refund and start a new sale.',
        body: { sale: { ...SAMPLE_SALE, status: 'underpaid', amountPaid: '3000.00', qrCode: null } },
      },
      {
        id: 'expired',
        status: 200,
        label: 'Expired',
        when: 'The customer didn’t pay in time.',
        ui: 'Stop polling. “This payment expired.” with a “New sale” button for the same amount.',
        body: { sale: { ...SAMPLE_SALE, status: 'expired', qrCode: null } },
      },
      {
        id: 'not-found',
        status: 404,
        label: 'Not found',
        when: 'No sale with this id in the current business.',
        ui: 'Go back to the sale list.',
        body: { error: 'Sale not found' },
      },
      unauthorized,
      serverError('Failed to fetch sale'),
    ],
    notes: [
      'Status values: pending → confirmed | underpaid | expired. "failed" means the checkout never started (rare).',
      'A push notification also arrives on payment. Polling is the fallback, so keep both.',
    ],
  },

  {
    slug: 'list-sales',
    group: 'sales',
    method: 'GET',
    path: '/sales/list',
    title: 'List sales',
    auth: 'user',
    summary: 'All sales for the business. Owners see everyone’s sales; sales reps see only their own.',
    whenToCall: 'On the Sales / History screen, and after a sale completes to refresh the list.',
    responses: [
      {
        id: 'ok',
        status: 200,
        label: 'Sales',
        when: 'Always (empty array when there are none).',
        ui: 'Sort newest first by `createdAt`. Badge by `status`. Show `amountPaid` when it differs from `amount`.',
        body: {
          sales: [
            { ...SAMPLE_SALE, status: 'confirmed', amountPaid: '5000.00', bachsPaymentId: 'ch_6912f40be1a8459fade95dcef4c5725e' },
            { ...SAMPLE_SALE, id: '1db8fc71-49e5-43db-a3f0-e3f282626752', paymentType: 'card', description: 'Phone case', status: 'expired' },
          ],
        },
      },
      unauthorized,
      serverError('Failed to list sales'),
    ],
    notes: ['No pagination yet. Sort and filter on the device for now.'],
  },
];
