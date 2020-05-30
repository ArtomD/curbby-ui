import { Customer } from './customer';
import { Conversation } from './conversation';
import { FormControl } from '@angular/forms';
import { WebhookData } from './webhook-data';

export interface Order {
  id: number;
  shopifyOrderNumber: number;
  location: string;
  phone: string;
  email: string;
  created: Date;
  displayDate: string;
  status: number;
  selected: boolean;
  save: boolean;
  customer: Customer;
  conversation: Conversation;
  webhook_datum: WebhookData;
  newMessageAvaliable: boolean;
  invalidPhone: boolean;
  phoneFormControl: FormControl;
}