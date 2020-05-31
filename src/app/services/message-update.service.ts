import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Order } from '../models/order';
import { MatDialog } from '@angular/material/dialog';
import { BackendServerService } from './backend-server.service';
import { MessageWindowComponent } from '../components/order-list/message-window/message-window.component';
import { OrderDetailsComponent } from '../components/order-list/order-details/order-details.component';

@Injectable({
  providedIn: 'root'
})
export class MessageUpdateService {

  public messages_data: Order[] = [];
  public messages_dataChange: Subject<any> = new Subject<any>();

  currentConversationOrder: Order;
  conversationOpen: boolean = false;
  unreadMessages: boolean = false;


  constructor(public dialog: MatDialog, public server: BackendServerService) { }

  updateMessages(messages: Order[]) {
    this.messages_data.length = 0;
    this.messages_data = [...messages];
    this.messages_dataChange.next(this.messages_data);
  }

  openConversation(order: Order) {
    this.currentConversationOrder = order;
    this.conversationOpen = true;
    const dialogRef = this.dialog.open(MessageWindowComponent, {
      data: order,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.server.conversations_data = null;
      this.conversationOpen = false;
      if (result == "OPEN_DETAIL") {
        this.openDetails(order);
      }
    });
  }

  openDetails(order: Order) {
    this.currentConversationOrder = order;
    const dialogRef = this.dialog.open(OrderDetailsComponent, {
      data: order,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == "OPEN_CONV") {
        this.openConversation(order);
      }
    });
  }


}
