export interface PlanTier {
  plan_id: string;
  name: string;
  price: number; // in BDT
  message_quota: number; // monthly broadcast message limit
  contact_limit: number; // max contacts limit
  razorpay_plan_id?: string;
  unlimited?: boolean;
}

export const PLAN_TIERS: Record<string, PlanTier> = {
  free: {
    plan_id: 'free',
    name: 'Free Trial',
    price: 0,
    message_quota: 100,
    contact_limit: 100,
    razorpay_plan_id: undefined,
  },
  starter: {
    plan_id: 'starter',
    name: 'Starter',
    price: 2999,
    message_quota: 5000,
    contact_limit: 1000,
    razorpay_plan_id: process.env.RAZORPAY_PLAN_STARTER_ID,
  },
  pro: {
    plan_id: 'pro',
    name: 'Growth',
    price: 2999,
    message_quota: 50000,
    contact_limit: 10000,
    razorpay_plan_id: process.env.RAZORPAY_PLAN_PRO_ID,
  },
  business: {
    plan_id: 'business',
    name: 'Managed',
    price: 2999,
    message_quota: 1000000, // Representing "unlimited" quota as 1,000,000
    contact_limit: 1000000, // Representing "unlimited" contacts as 1,000,000
    razorpay_plan_id: process.env.RAZORPAY_PLAN_BUSINESS_ID,
    unlimited: true,
  },
};

/**
 * Helper to fetch a plan tier by its string ID. Falls back to Free plan.
 */
export function getPlanById(planId: string): PlanTier {
  return PLAN_TIERS[planId] || PLAN_TIERS.free;
}
