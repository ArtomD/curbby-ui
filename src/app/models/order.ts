export interface Order {
    id: number;
    orderNumber: number;
    location: string;
    phone: number;
    email: string;
    date: Date;
    status: string;
    selected: boolean;
  }