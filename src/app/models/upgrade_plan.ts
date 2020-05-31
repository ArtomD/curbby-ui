export interface PlanUpgrade {
    id: string;
    fee: number;
    startDate: Date;
    billingPlanId: string;
    shopId: string;
    created: Date;
    modified: Date;
    endDate: Date;
    shopifyChargeId: number;
    shopifyStatus: number;
    shopifyRegistrationUrl: string;
}