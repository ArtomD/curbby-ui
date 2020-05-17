
export interface CustomerStats {
    RFP: ReadyForPickup[];
    CW: CustomerWaiting[];
}

interface ReadyForPickup{
    date: Date;
    amount: number;
    max: number;
    average: number;
}

interface CustomerWaiting{
    date: Date;
    amount: number;
    max: number;
    average: number;
}