export interface Stats {
    currentBillingPeriod : CurrentBillingPeriod;
    current: Current;
    previous: Previous;
    month: string;
}

interface CurrentBillingPeriod {
    from: Date;
    to:Date;
}

interface Current {
    outboundCustomerMessages: number;
    inboundCustomerMessages:number;
    forwardedMessages:number;
    ordersManaged:number;
}

interface Previous {
    outboundCustomerMessages: number;
    inboundCustomerMessages:number;
    forwardedMessages:number;
    ordersManaged:number;
}