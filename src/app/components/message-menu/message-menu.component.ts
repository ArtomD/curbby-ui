import { Component, OnInit } from '@angular/core';
import { MessageUpdateService } from 'src/app/services/message-update.service';
import { Order } from 'src/app/models/order';
import { MatDialog } from '@angular/material/dialog';
import { BackendServerService } from 'src/app/services/backend-server.service';

@Component({
  selector: 'app-message-menu',
  templateUrl: './message-menu.component.html',
  styleUrls: ['./message-menu.component.css']
})
export class MessageMenuComponent implements OnInit {

  messages: Order[] = [];
  test: any[] = [1, 2, 3];

  constructor(public server: BackendServerService, public messageUpdateService: MessageUpdateService) {
    this.synchMessagesObject();
    this.messageUpdateService.messages_dataChange.subscribe(value => {
      this.synchMessagesObject();
    })
  }

  ngOnInit(): void {
  }


  synchMessagesObject() {
    if (this.messages)
      this.messages.length = 0;
    this.messageUpdateService?.messages_data.forEach(element => {
      this.messages.push(element);
    });
    //this.sleep(0).then(() => this.showMessage = true);
    //console.log(this.messages);
    //this.changeDetection.detectChanges();
  }
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  openChat(order: Order) {
    this.messageUpdateService.openConversation(order);
  }



}
