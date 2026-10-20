import type { Endpoint } from './types';
import { ownerOnly, providerDown, serverError, unauthorized, validation } from './common';

export const paymentSetup: Endpoint[] = [
  {
    slug: 'payment-status',
    group: 'payment-setup',
    method: 'GET',
    path: '/onboarding/payments/status',
    title: 'Check payment status',
    auth: 'user',
    summary:
      'Tells you whether the business can accept and withdraw money yet, and what (if anything) is still missing.',
    whenToCall:
      'On the home screen (to decide whether to show the “Complete verification” banner), and on the page the user lands on after the verification flow.',
    responses: [
      {
        id: 'active',
        status: 200,
        label: 'Ready',
        when: 'Verification is complete. The business can sell and withdraw.',
        ui: 'Hide the banner. Everything is unlocked.',
        body: { status: 'active', canCollect: true, canPayout: true, currentlyDue: [], errors: [] },
      },
      {
        id: 'action-required',
        status: 200,
        label: 'Action required',
        when: 'The owner still has to provide something (ID, business details, bank account).',
        ui: 'Show “Complete verification” → Start verification. If `errors` has items, show each `reason` (it’s written for users).',
        body: {
          status: 'action_required',
          canCollect: false,
          canPayout: false,
          currentlyDue: ['persons.per_a90af3c9.id_document', 'business_profile.product_description'],
          errors: [
            {
              field: 'persons.per_a90af3c9.id_document',
              code: 'unreadable',
              reason: 'The document image was too blurry to read.',
            },
          ],
        },
      },
      {
        id: 'review',
        status: 200,
        label: 'Under review',
        when: 'Everything was submitted and is being checked (usually within a day).',
        ui: '“We’re reviewing your details. We’ll notify you when payments are enabled.” (A push arrives when it’s done.)',
        body: { status: 'under_review', canCollect: false, canPayout: false, currentlyDue: [], errors: [] },
      },
      {
        id: 'not-created',
        status: 200,
        label: 'No payment account',
        when: 'The payment account couldn’t be created at sign-up.',
        ui: 'Show the banner. Start verification will create it.',
        body: { status: 'not_created' },
      },
      unauthorized,
      serverError('Could not load payment status'),
    ],
    notes: [
      'Gate selling on canCollect and withdrawing on canPayout. Never on an empty currentlyDue list.',
      'Sales reps can call this too, to show “Payments aren’t enabled yet” instead of a broken sale screen.',
    ],
  },

  {
    slug: 'start-verification',
    group: 'payment-setup',
    method: 'POST',
    path: '/onboarding/payments/link',
    title: 'Start verification',
    auth: 'owner',
    summary:
      'Returns a secure link to a hosted verification page (run by our payment provider) where the owner uploads ID, adds business details and their bank account. We never handle their documents.',
    whenToCall:
      'Only when the owner taps “Complete verification”. Each new link cancels the previous one, so never create it on page load.',
    responses: [
      {
        id: 'ok',
        status: 200,
        label: 'Link ready',
        when: 'There is something to complete.',
        ui: 'Open `url` (web: same tab; mobile: in-app browser). When they come back, call Check payment status.',
        body: {
          url: 'https://connect.bachs.io/setup/c/acct_TjFfYvIY0JAIL9BG/al_hYbRHgzqK5e9t39bfS4',
          expiresAt: '2026-11-19T22:53:39.530Z',
        },
      },
      {
        id: 'nothing-left',
        status: 409,
        label: 'Nothing to complete',
        when: 'All details are already submitted.',
        ui: 'Call Check payment status and show “Under review” or “Ready”.',
        body: { error: 'Nothing left to submit', code: 'CONNECTED_ACCOUNT_REQUIREMENTS_NOT_FOUND' },
      },
      {
        id: 'under-review',
        status: 409,
        label: 'Account on hold',
        when: 'The account was paused or rejected by the provider.',
        ui: '“Your account is under review. Contact support.” and link to support.',
        body: { error: 'This account is under review. Contact support.', code: 'CONNECTED_ACCOUNT_NOT_ELIGIBLE_FOR_LINK' },
      },
      {
        id: 'no-account',
        status: 409,
        label: 'No payment account',
        when: 'The payment account doesn’t exist yet.',
        ui: 'Ask the owner to try again shortly, or contact support.',
        body: { error: 'Payment account not created yet' },
      },
      unauthorized,
      ownerOnly,
      serverError('Could not start verification'),
    ],
    notes: [
      'Web app: the page sends the user back to /onboarding/payments/done (finished or abandoned) or /onboarding/payments/refresh (link expired). On /refresh, call this endpoint again and redirect.',
      'Landing on /done does NOT mean they finished. Always check the status.',
    ],
  },

  {
    slug: 'onboarding-banks',
    group: 'payment-setup',
    method: 'GET',
    path: '/onboarding/banks',
    title: 'List banks',
    auth: 'user',
    summary: 'All Nigerian banks with their codes, for a bank picker.',
    whenToCall: 'When showing a bank dropdown. Cache it for the session: the list rarely changes.',
    responses: [
      {
        id: 'ok',
        status: 200,
        label: 'Banks',
        when: 'Always.',
        ui: 'Show a searchable list by `name`; send `code` to other endpoints. Some names contain &amp;, so decode HTML entities before showing.',
        body: {
          banks: [
            { name: 'Access Bank Nigeria', code: '044' },
            { name: 'GTBank Plc', code: '058' },
            { name: 'Kuda Micro-finance Bank', code: '50211' },
            { name: 'Moniepoint microfinance', code: '090405' },
            { name: 'Opay (Paycom)', code: '305' },
          ],
        },
      },
      unauthorized,
      providerDown('Could not load banks'),
    ],
    notes: ['Same data as Payout destinations → List banks. Use either.'],
  },

  {
    slug: 'resolve-bank',
    group: 'payment-setup',
    method: 'POST',
    path: '/onboarding/resolve-bank',
    title: 'Check a bank account name',
    auth: 'user',
    summary: 'Looks up the real account holder name for an account number + bank, so the user can confirm it before saving.',
    whenToCall: 'As soon as the 10th digit of the account number is typed and a bank is selected.',
    body: [
      { name: 'accountNumber', type: 'string', required: true, description: 'NUBAN account number.', example: '0123456789', rules: 'Exactly 10 digits.' },
      { name: 'bankCode', type: 'string', required: true, description: 'From List banks.', example: '058' },
    ],
    exampleBody: { accountNumber: '0123456789', bankCode: '058' },
    responses: [
      {
        id: 'ok',
        status: 200,
        label: 'Name found',
        when: 'The account exists at that bank.',
        ui: 'Show the name under the field with a tick: “ADA OBI”. Only enable Save after this succeeds.',
        body: { accountName: 'ADA OBI' },
      },
      {
        id: 'not-found',
        status: 400,
        label: 'Account not found',
        when: 'The number doesn’t exist at that bank.',
        ui: '“We couldn’t find this account. Check the number and bank.”',
        body: { error: 'Account number could not be verified with this bank' },
      },
      validation('accountNumber', 'Invalid value', '01234'),
      unauthorized,
      providerDown('Bank lookup unavailable, try again'),
    ],
  },

  {
    slug: 'payment-setup-form',
    group: 'payment-setup',
    method: 'POST',
    path: '/onboarding/payment-setup',
    title: 'Submit details in-app (advanced)',
    auth: 'owner',
    summary:
      'Submits the representative’s name and the payout bank account from your own form, instead of the hosted page. ID documents still need the hosted page.',
    whenToCall:
      'Optional. Prefer Start verification, which handles everything and stays up to date when requirements change. Use this only if Danny asks for an in-app form.',
    body: [
      { name: 'representative', type: 'object', required: true, description: '{ firstName, lastName } of the person running the business.', example: { firstName: 'Ada', lastName: 'Obi' } },
      { name: 'bankAccount', type: 'object', required: true, description: '{ accountNumber, bankCode } where payouts go.', example: { accountNumber: '0123456789', bankCode: '058' }, rules: 'accountNumber: 10 digits.' },
      { name: 'company', type: 'object', required: false, description: 'Registered companies only: { registeredName, registrationNumber }.', example: { registeredName: 'Ada Stores Ltd', registrationNumber: 'RC1234567' } },
    ],
    exampleBody: {
      representative: { firstName: 'Ada', lastName: 'Obi' },
      bankAccount: { accountNumber: '0123456789', bankCode: '058' },
    },
    responses: [
      {
        id: 'needs-docs',
        status: 200,
        label: 'Saved, ID needed',
        when: 'Details saved but an ID document is still required.',
        ui: 'Open `documentUploadUrl` so they can upload their ID.',
        body: {
          message: 'Details saved. Upload your ID to finish.',
          onboarding: { currentlyDue: ['persons.per_a90af3c9.id_document'], pendingVerification: ['payout_destination'], pastDue: [], errors: [], capabilities: { payouts: 'restricted' } },
          documentUploadUrl: 'https://connect.bachs.io/setup/c/acct_TjFfYvIY0JAIL9BG/al_x9Qm…',
        },
      },
      {
        id: 'submitted',
        status: 200,
        label: 'Submitted',
        when: 'Nothing else is needed from the user.',
        ui: '“Details submitted. We’ll notify you once payments are enabled.”',
        body: {
          message: 'Details submitted. We will notify you once payments are enabled.',
          onboarding: { currentlyDue: [], pendingVerification: ['persons.per_a90af3c9.name', 'payout_destination'], pastDue: [], errors: [], capabilities: { payouts: 'restricted' } },
          documentUploadUrl: null,
        },
      },
      {
        id: 'bank-not-found',
        status: 400,
        label: 'Bank account not found',
        when: 'The bank account couldn’t be verified.',
        ui: 'Highlight the bank fields: “We couldn’t verify this account.”',
        body: { error: 'Account number could not be verified with this bank', field: 'bankAccount' },
      },
      {
        id: 'rejected',
        status: 400,
        label: 'Details rejected',
        when: 'The provider rejected one of the fields. Nothing was saved.',
        ui: 'Show each fieldErrors[].message, let them fix it and resubmit everything.',
        body: {
          error: 'Some details were rejected. Nothing was saved, fix them and resubmit.',
          fieldErrors: [{ field: 'company.registration_number', message: 'Invalid registration number', type: 'value_error' }],
        },
      },
      validation('representative.firstName', 'Invalid value'),
      unauthorized,
      ownerOnly,
      serverError('Failed to set up payments'),
    ],
  },
];
