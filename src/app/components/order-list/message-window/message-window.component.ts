import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendServerService } from 'src/app/services/backend-server.service';
import { Order } from 'src/app/models/order';
import { Conversation } from '../../../models/conversation';
import { SMS } from '../../../models/sms'
import { Message } from 'src/app/models/message';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../../snackbar/snackbar.component';

import { PENDING_MSG_ORIGIN, MSG_TIMESTAMP_ORIGIN, MSG_ORDER_ORIGIN } from '../../../shared/config'

@Component({
  selector: 'app-message-window',
  templateUrl: './message-window.component.html',
  styleUrls: ['./message-window.component.css']
})
export class MessageWindowComponent implements OnInit {

  @ViewChild('scrollBottom') private scrollBottom: ElementRef;

  disableScrollDown = false
  text: string;
  order: Order;
  orders: Order[] = [];
  conversation: Conversation;
  windowOpen: boolean = false;
  manualRefresh: boolean = false;
  monthName: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  myEventSubscription;

  constructor(
    public dialogRef: MatDialogRef<MessageWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Order,
    public server: BackendServerService, private _snackBar: MatSnackBar) {
    this.order = data;
    this.manualRefresh = true;
    this.myEventSubscription = this.server.conversations_dataChange.subscribe(value => {
      this.synchConversationObject();
    })
    this.server.getConversation(this.order.phone);
  }

  synchConversationObject() {
    this.conversation = this.server.conversations_data;
    this.conversation.messages.forEach(m => {
      let count = 0;

    })
    var messageWindowSeconds = 60;
    var lastTimeStamp = null;
    var lastType = -99;
    for (let i = 0; i < this.conversation.messages.length; i++) {
      if (this.conversation.messages[i].origin == MSG_TIMESTAMP_ORIGIN) {
        this.conversation.messages.splice(i, 1);
        i--;
      }
    }

    //inserts timestamp under message (to move it above message change offset below to 0)
    let offset = 1;
    for (let i = 0; i < this.conversation.messages.length; i++) {
      if (this.conversation.messages[i].origin == 0 || this.conversation.messages[i].origin == 1 || this.conversation.messages[i].origin == 2 || this.conversation.messages[i].origin == 4) {
        if (lastType != this.conversation.messages[i].origin || ((new Date(this.conversation.messages[i].created).getTime() - lastTimeStamp.getTime()) / 1000) > 60) {
          lastType = this.conversation.messages[i].origin;
          lastTimeStamp = new Date(this.conversation.messages[i].created);
          this.conversation.messages.splice(i, 0, this.customMessage(MSG_TIMESTAMP_ORIGIN, this.conversation.messages[i].created, this.conversation.messages[i].created.toString()));
          i++;
        }

      }
    }
    //scrolls to bottom of chat(happens on chat load and new message sent)
    if (this.manualRefresh) {
      this.scrollToBottom();
      this.manualRefresh = false;
    }

  }

  ngOnDestroy() {
    this.myEventSubscription.unsubscribe()
  }

  insertOrders() {
    this.getOrders();

    //clears out all orders from conversation
    for (let i = 0; i < this.conversation.messages.length; i++) {
      if (this.conversation.messages[i].origin == MSG_ORDER_ORIGIN) {
        this.conversation.messages.splice(i, 1);
        i--;
      }
    }
    let orderIndex = 0;
    let msgIndex = 0;

    //inserts orders before conversation started
    for (; orderIndex < this.orders.length; orderIndex++) {
      if (new Date(this.orders[orderIndex].created) < new Date(this.conversation.messages[msgIndex].created)) {
        this.conversation.messages.splice(orderIndex, 0, this.customMessage(MSG_ORDER_ORIGIN, this.orders[orderIndex].created, "ORDER BEFORE"));
        msgIndex++;
      } else {
        break;
      }
    }
    //inserts orders in the middle of the conversation
    for (; msgIndex < this.conversation.messages.length; msgIndex++) {
      if (new Date(this.orders[orderIndex].created) < new Date(this.conversation.messages[msgIndex].created)) {
        this.conversation.messages.splice(msgIndex, 0, this.customMessage(MSG_ORDER_ORIGIN, this.orders[orderIndex].created, "ORDER BEFORE"));
        // set last type = type of message inserted date before
        orderIndex++;
        msgIndex++;
      }
    }
    //inserts orders after conversation
    for (; orderIndex < this.orders.length; orderIndex++) {
      this.conversation.messages.push(this.customMessage(MSG_ORDER_ORIGIN, this.orders[orderIndex].created, "ORDER BEFORE"));
    }
  }

  getOrders() {
    //clear array
    this.orders.length = 0;
    //populate array
    this.server.order_data.forEach(o => {
      if (o.phone == this.order.phone) {
        this.orders.push(o);
      }
    })
    //sort array
    this.orders.sort(function (a, b) {
      return new Date(a.created).getTime() - new Date(b.created).getTime();
    })
  }

  orderToMessage(order: Order, type: number, msg: string) {
    return this.customMessage(MSG_ORDER_ORIGIN, order.created, msg);
  }

  customMessage(type: number, date: Date, payload: string) {
    return <Message>{
      id: 0, payload: payload, conversationId: 0,
      created: new Date(date), modified: new Date(date), awsId: "",
      to: "", from: "", origin: type, displayDate: ""
    }
  }

  ngOnInit(): void {
    this.sleep(100).then(() => this.scrollToBottom());
  }

  setDate(date: Date) {
    let today = new Date();
    let returnString = "";
    if (today.getFullYear() != date.getFullYear() || today.getDate() != date.getDate()) {
      returnString += date.getDate() + " " + this.monthName[date.getMonth()] + " " + date.getFullYear() + " - ";
    }
    returnString += this.formatAMPM(date);
    return returnString;
  }

  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }


  scrollToBottom(): void {
    try {
      this.scrollBottom.nativeElement.scrollTop = this.scrollBottom.nativeElement.scrollHeight;
    } catch (err) { }
  }

  async send() {
    if (this.text.length > 0) {
      let sms: SMS = { message: this.text, phone: this.order.phone.toString(), subject: "" };
      let tempMsg: Message = this.customMessage(PENDING_MSG_ORIGIN, new Date, this.text);
      this.conversation.messages.push(tempMsg);
      this.server.conversations_data = this.conversation;
      this.manualRefresh = true;
      this.server.conversations_dataChange.next(this.server.conversations_data);
      this.text = "";
      this.sleep(100).then(() => this.scrollToBottom());
      this.server.sendSMS(sms).subscribe((value) => {
        if (value.status != 200) {
          this.openSnackBar("Message failed to send");
          this.sleep(3000).then(() => this._snackBar.dismiss());
        }
        this.sleep(3000).then(() => this.server.getConversation(this.order.phone));
      });
    }
  }

  readInputKey(event) {
    if (event.code == "Enter") {
      this.send();
    }
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackbarComponent, {
      data: message
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  close() {
    this.dialogRef.close();
  }

  openDetails() {
    this.dialogRef.close("OPEN_DETAIL");
  }
}
