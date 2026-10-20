import type { Endpoint } from './types';
import { ownerOnly, paymentsNotSetUp, serverError, unauthorized } from './common';

const providerBusy = {
  id: 'provider-down',
  status: 502,
  label: 'Couldn’t load',
  when: 'Our payment provider didn’t respond.',
  ui: 'Keep the last known balance on screen with a small “Couldn’t refresh” note and a retry.',
  body: { error: 'Could not load balances, try again' },
};

export const balances: Endpoint[] = [
  {
    slug: 'balances',
    group: 'balances',
    method: 'GET',
    path: '/wallets',
    title: 'Get balances',
    auth: 'owner',
    summary:
      'The business’s money, per currency: what can be withdrawn now (available) and what is still settling (pending), plus when it settles.',
    whenToCall: 'On the Wallet / Balance screen and after a withdrawal. Pull-to-refresh friendly: results are cached for 15 seconds.',
    responses: [
      {
        id: 'ok',
        status: 200,
        label: 'Balances',
        when: 'Always, for a business with a payment account.',
        ui: 'Headline: NGN `available`. Under it: “₦4,925 settling” from `pending`, with the date from `pendingSettlements`. Only show USD if it isn’t "0.00".',
        body: {
          balances: [
            { currency: 'NGN', available: '19675.00', pending: '4925.00', heldForDisputes: '0.00' },
            { currency: 'USD', available: '0.00', pending: '0.00', heldForDisputes: '0.00' },
          ],
          pendingSettlements: [{ date: '2026-10-21T00:00:00+00:00', currency: 'NGN', total: '4925.00' }],
          totalBalanceUsd: '17.56',
        },
      },
      paymentsNotSetUp,
      unauthorized,
      ownerOnly,
      providerBusy,
    ],
    notes: [
      'Only `available` can be withdrawn. Pending money moves to available automatically.',
      'USD normally stays 0. It only holds money briefly during a crypto withdrawal.',
    ],
  },

  {
    slug: 'total-balance',
    group: 'balances',
    method: 'GET',
    path: '/wallets/total-balance',
    title: 'Get total balance',
    auth: 'owner',
    summary: 'One naira figure for the dashboard: everything available, with any USD converted at today’s rate.',
    whenToCall: 'On the home dashboard card.',
    responses: [
      {
        id: 'ok',
        status: 200,
        label: 'Total',
        when: 'Always, for a business with a payment account.',
        ui: 'Big number: `totalBalanceNgn`. Small line: “+ ₦4,925 settling” when `pendingBalanceNgn` isn’t "0.00".',
        body: {
          totalBalanceNgn: '19675.00',
          pendingBalanceNgn: '4925.00',
          totalBalanceUsd: '17.56',
          breakdown: [
            { currency: 'NGN', amount: '19675.00', pending: '4925.00', ngnEquivalent: 19675 },
            { currency: 'USD', amount: '0.00', pending: '0.00', ngnEquivalent: 0 },
          ],
        },
      },
      paymentsNotSetUp,
      unauthorized,
      ownerOnly,
      providerBusy,
    ],
    notes: ['If `rateFallback: true` appears, the USD rate is an estimate. Fine for display.'],
  },

  {
    slug: 'rates',
    group: 'balances',
    method: 'GET',
    path: '/wallets/rates',
    title: 'Get stablecoin rates',
    auth: 'user',
    summary: 'Approximate USDT and USDC prices in naira and dollars, for display only.',
    whenToCall: 'Where you show “1 USDT ≈ ₦1,378”. Real withdrawal rates come from Get a withdrawal quote.',
    responses: [
      {
        id: 'ok',
        status: 200,
        label: 'Rates',
        when: 'Always. If the price feed is down you still get a response with `fallback: true`.',
        ui: 'Show “≈” in front of the number. When `fallback` is true, hide the rate or label it “estimate”.',
        body: {
          rates: { USDT: { NGN: 1378.54, USD: 1 }, USDC: { NGN: 1379.1, USD: 1 } },
          timestamp: '2026-10-19T21:48:00.000Z',
        },
      },
      unauthorized,
      serverError('Failed to fetch rates'),
    ],
  },
];
