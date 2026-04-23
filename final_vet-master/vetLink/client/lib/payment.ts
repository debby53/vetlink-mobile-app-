// Payment helpers have been removed. Keep no-op stubs to avoid import errors.

export async function fetchCheckoutConfig(_: number) {
  return null;
}

export function openCheckoutPopup() {
  throw new Error('Payment functionality removed from frontend');
}
