import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendServerService } from 'src/app/services/backend-server.service';
import { Order } from 'src/app/models/order';
import { Conversation } from 'src/app/models/conversation';

@Component({
  selector: 'app-message-window',
  templateUrl: './message-window.component.html',
  styleUrls: ['./message-window.component.css']
})
export class MessageWindowComponent implements OnInit {

  text : string;
  order:Order;
  conversation: Conversation;

  constructor(
    public dialogRef: MatDialogRef<MessageWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Order,
    public server: BackendServerService) {
      this.server.getConversation(data.phone);
      this.order = data;
      this.synchConversationObject();      
      this.server.conversations_dataChange.subscribe(value => { 
        this.synchConversationObject();
      })
    }

    synchConversationObject(){
      this.conversation = this.server.conversations_data;
      console.log(this.conversation);
    }

  ngOnInit(): void {
  }



  send(){
    console.log(this.text);
  }

  refresh(){
    this.server.getConversation(this.order.phone)
  }
}
