import { Text } from './text';

export interface Conversation {
    id: number;
    created: Date;
    modified: Date;
    lastRead: Date;
    phone: string;
    shopid: number;
    trail: string;
  }