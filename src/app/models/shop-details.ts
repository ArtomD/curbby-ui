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
}