export interface Plan {
    id: string;
    fee: number;
    created: Date;
    modified: Date;
    name: string;
    billable: boolean;
    credits: number;
    standard: boolean;
}
