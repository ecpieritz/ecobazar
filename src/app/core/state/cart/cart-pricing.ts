import type { Coupon } from '@core/domain';

export const STANDARD_SHIPPING_AMOUNT = 5;
export const FREE_SHIPPING_THRESHOLD = 50;

export const MOCK_COUPONS: readonly Coupon[] = [
  {
    code: 'FRESH10',
    description: '10% off orders of $25 or more',
    discountType: 'percentage',
    discountValue: 10,
    minimumSubtotal: 25,
  },
  {
    code: 'SAVE5',
    description: '$5 off orders of $20 or more',
    discountType: 'fixed',
    discountValue: 5,
    minimumSubtotal: 20,
  },
];

export const normalizeCouponCode = (code: string): string => code.trim().toUpperCase();

export const findMockCoupon = (code?: string): Coupon | null => {
  const normalizedCode = normalizeCouponCode(code ?? '');
  return MOCK_COUPONS.find((coupon) => coupon.code === normalizedCode) ?? null;
};

export const calculateCouponDiscount = (subtotal: number, coupon: Coupon | null): number => {
  if (!coupon || subtotal < coupon.minimumSubtotal) {
    return 0;
  }

  const rawDiscount =
    coupon.discountType === 'percentage'
      ? subtotal * (coupon.discountValue / 100)
      : coupon.discountValue;

  return Math.min(subtotal, rawDiscount);
};

export const calculateShipping = (subtotal: number): number => {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return STANDARD_SHIPPING_AMOUNT;
};
