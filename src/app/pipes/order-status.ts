import { Pipe, PipeTransform } from '@angular/core';
import { Order } from '../models/order';

@Pipe({name: 'unreadMsg',pure: true})
export class OrderIsReadPipe implements PipeTransform {
  transform(orders: Order[]): Order[] {
    return orders.filter(order => order.newMessageAvaliable);
  }
}