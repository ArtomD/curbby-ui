import { Customer } from './customer';
import { Conversation } from './conversation';

export interface Order {
    id: number;
    orderNumber: number;
    location: string;
    phone: number;
    email: string;
    created: Date;
    displayDate: string;
    status: number;
    selected: boolean;
    save: boolean;
    customer: Customer;
    conversation: Conversation;
    newMessageAvaliable: boolean;
    invalidPhone: boolean;
  }