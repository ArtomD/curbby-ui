export interface ShopDetails {
    id: number;
    name: string;
    created: Date;
    modified: Date;
    initialized: boolean,
    autoConfirmOrders: boolean,
    autoReadyForPickup: boolean,
    forwardCustomerMessages: boolean,
    shopifyEmail: string;
    shopifyName: string;
    shopifyCountry: string;
    activated: Date;
    billingPlanId: BillingPlan;
    billing: Billing;
}

interface BillingPlan {
    id: number;
    fee: number;
    name: string;
    billable: boolean;
    credits: number;
}

interface Billing {
    usage: number;
    periodStart: Date;
    periodDuration: number;
    usageMax: number;
}
