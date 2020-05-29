import { Message } from './message';

export interface Conversation {
  id: number;
  shopId: number;
  created: Date;
  modified: Date;
  phone: string;
  lastInbound: Date;
  lastOutbound: Date;
  lastRead: Date;
  messages: Message[];
  lastInboundMessage: string;
}
