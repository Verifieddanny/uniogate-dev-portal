import type { Endpoint } from './types';
import {
  SAMPLE_ACCESS_TOKEN,
  SAMPLE_BUSINESS_ID,
  SAMPLE_REFRESH_TOKEN,
  SAMPLE_USER,
  serverError,
  unauthorized,
  validation,
} from './common';

export const auth: Endpoint[] = [
  {
    slug: 'request-otp',
    group: 'auth',
    method: 'POST',
    path: '/auth/otp/request',
    title: 'Request a login code',
    auth: 'none',
    summary:
      'Sends a 6-digit code to the user’s email. This is the first step of both sign-up and log-in: UnioGate has no passwords.',
    whenToCall:
      'When the user taps “Continue” after typing their email on the welcome screen, and again for “Resend code”. Each new request cancels the previous code.',
    body: [
      {
        name: 'identifier',
        type: 'string',
        required: true,
        description: 'The user’s email address.',
        example: 'ada@example.com',
        rules: 'Trimmed and lower-cased by the server.',
      },
      {
        name: 'type',
        type: 'string',
        required: true,
        description: 'Where to send the code.',
        example: 'email',
        rules: '"email" or "whatsapp". WhatsApp is on hold, so always send "email" for now.',
      },
    ],
    exampleBody: { identifier: 'ada@example.com', type: 'email' },
    responses: [
      {
        id: 'ok',
        status: 200,
        label: 'Code sent',
        when: 'The code was created and the email is on its way.',
        ui: 'Go to the code screen and show “We sent a code to ada@example.com”. Enable “Resend code” after about 60 seconds.',
        body: { message: 'OTP sent successfully' },
      },
      validation('identifier', 'Email or phone number is required'),
      serverError('Failed to send OTP'),
    ],
    notes: [
      'Codes are 6 digits and expire after 10 minutes.',
      'See the exact email the user receives under Email preview.',
    ],
  },

  {
    slug: 'verify-otp',
    group: 'auth',
    method: 'POST',
    path: '/auth/otp/verify',
    title: 'Verify the login code',
    auth: 'none',
    summary:
      'Checks the 6-digit code. The response tells you which of three screens comes next: create a profile (new user), finish business setup, or straight into the app with tokens.',
    whenToCall: 'When the user has typed all 6 digits on the code screen. Auto-submit on the 6th digit feels best.',
    body: [
      {
        name: 'identifier',
        type: 'string',
        required: true,
        description: 'The same email used in Request a login code.',
        example: 'ada@example.com',
        rules: 'Send it lower-cased, exactly as you sent it before.',
      },
      {
        name: 'code',
        type: 'string',
        required: true,
        description: 'The 6-digit code from the email.',
        example: '482913',
        rules: 'Exactly 6 characters. Send as a string so leading zeros survive.',
      },
    ],
    exampleBody: { identifier: 'ada@example.com', code: '482913' },
    responses: [
      {
        id: 'new-user',
        status: 201,
        label: 'New user',
        when: 'The code is right and nobody has signed up with this email yet.',
        ui: 'Go to Create profile. Keep `identifier` (and `inviteBusinessId` if `hasInvite` is true) for that call. No tokens yet.',
        body: {
          isNewUser: true,
          identifier: 'ada@example.com',
          hasInvite: false,
          inviteBusinessId: null,
          message: 'OTP verified. Complete your profile to continue.',
        },
      },
      {
        id: 'needs-business',
        status: 200,
        label: 'Needs business setup',
        when: 'The user has a profile but never finished creating a business.',
        ui: 'Go to Create business and pass this `userId`. No tokens yet.',
        body: {
          isNewUser: false,
          needsOnboarding: true,
          userId: SAMPLE_USER.id,
          message: 'Complete your business setup to continue.',
        },
      },
      {
        id: 'signed-in',
        status: 200,
        label: 'Signed in',
        when: 'Returning user with a business. This is the normal log-in.',
        ui: 'Store both tokens securely (Keychain / Keystore / httpOnly storage), then open the home screen for `role.role`.',
        body: {
          isNewUser: false,
          needsOnboarding: false,
          accessToken: SAMPLE_ACCESS_TOKEN,
          refreshToken: SAMPLE_REFRESH_TOKEN,
          user: SAMPLE_USER,
          role: { role: 'owner', businessId: SAMPLE_BUSINESS_ID },
        },
      },
      {
        id: 'bad-code',
        status: 400,
        label: 'Wrong or expired code',
        when: 'The code doesn’t match, was already used, or is older than 10 minutes.',
        ui: 'Shake the code input, clear it, and show “That code is wrong or expired.” with a “Resend code” link.',
        body: { error: 'Invalid or expired OTP' },
      },
      validation('code', 'OTP code must be 6 digits', '4829'),
      serverError('Verification failed'),
    ],
    notes: [
      'Branch on the response, not the status code: check isNewUser first, then needsOnboarding.',
      '`role.role` is "owner" or "sales_rep". It decides which home screen to show.',
    ],
  },

  {
    slug: 'refresh-tokens',
    group: 'auth',
    method: 'POST',
    path: '/auth/token/refresh',
    title: 'Refresh tokens',
    auth: 'none',
    summary:
      'Swaps a refresh token for a new access token and a new refresh token. The old refresh token stops working immediately (rotation).',
    whenToCall:
      'Whenever any request returns 401. Refresh once, save both new tokens, then retry the original request. Make sure two parallel 401s don’t trigger two refreshes.',
    body: [
      {
        name: 'refreshToken',
        type: 'string',
        required: true,
        description: 'The refresh token you saved at sign-in (or from the last refresh).',
        example: SAMPLE_REFRESH_TOKEN,
      },
    ],
    exampleBody: { refreshToken: SAMPLE_REFRESH_TOKEN },
    responses: [
      {
        id: 'ok',
        status: 200,
        label: 'New tokens',
        when: 'The refresh token is valid.',
        ui: 'Replace BOTH stored tokens, then retry the request that failed.',
        body: { accessToken: SAMPLE_ACCESS_TOKEN, refreshToken: SAMPLE_REFRESH_TOKEN },
      },
      {
        id: 'expired',
        status: 401,
        label: 'Session ended',
        when: 'The refresh token is unknown, already used, or older than 7 days.',
        ui: 'Clear the stored tokens and send the user to the welcome screen. Don’t retry.',
        body: { error: 'Invalid or expired refresh token' },
      },
      validation('refreshToken', 'Refresh token is required'),
      serverError('Token refresh failed'),
    ],
    notes: [
      'Access tokens last 15 minutes, refresh tokens 7 days.',
      'Because tokens rotate, always save the NEW refresh token. Re-using an old one logs the user out.',
    ],
  },

  {
    slug: 'logout',
    group: 'auth',
    method: 'POST',
    path: '/auth/logout',
    title: 'Log out',
    auth: 'user',
    summary: 'Ends the session on the server so the refresh token can never be used again.',
    whenToCall:
      'When the user taps “Log out”. Call Unregister device first (so this phone stops getting pushes), then this, then clear local tokens.',
    body: [
      {
        name: 'refreshToken',
        type: 'string',
        required: false,
        description: 'The current refresh token. Send it so the session is really ended on the server.',
        example: SAMPLE_REFRESH_TOKEN,
      },
    ],
    exampleBody: { refreshToken: SAMPLE_REFRESH_TOKEN },
    responses: [
      {
        id: 'ok',
        status: 200,
        label: 'Logged out',
        when: 'Always, once the user is signed in.',
        ui: 'Clear both tokens and go to the welcome screen.',
        body: { message: 'Logged out successfully' },
      },
      unauthorized,
      serverError('Logout failed'),
    ],
    notes: ['If this call fails, still clear local tokens. The user asked to leave.'],
  },
];
