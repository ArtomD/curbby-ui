import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendServerService } from 'src/app/services/backend-server.service';
import { Order } from 'src/app/models/order';
import { Conversation } from '../../models/conversation';
import {SMS} from '../../models/sms'
import { Message } from 'src/app/models/message';

@Component({
  selector: 'app-message-window',
  templateUrl: './message-window.component.html',
  styleUrls: ['./message-window.component.css']
})
export class MessageWindowComponent implements OnInit {

  @ViewChild('scrollBottom') private scrollBottom: ElementRef;

  disableScrollDown = false

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
      this.scrollToBottom();
      //this.messages.changes.subscribe(this.scrollToBottom);
    }

  ngOnInit(): void {
  }
  
  

  scrollToBottom(): void {
    try {
        this.scrollBottom.nativeElement.scrollTop = this.scrollBottom.nativeElement.scrollHeight;
    } catch(err) { }
}

  send(){
    let sms: SMS = {message:this.text, phone:this.order.phone.toString(),subject:""};
    let tempMsg : Message = { id: 0, payload: this.text, conversationId: 0, 
                              created: new Date, modified: new Date, awsId: "",
                              to: "", from: "", origin: 4, };
    console.log(this.server.conversations_data.messages[this.server.conversations_data.messages.length-1].payload);
    this.conversation.messages.push(tempMsg);
    this.server.conversations_data = this.conversation;
    this.server.conversations_dataChange.next(this.server.conversations_data);
    console.log(this.server.conversations_data.messages[this.server.conversations_data.messages.length-1].payload);
    
    //this.server.sendSMS(sms).then((value) => {
      
    //});
  }

  refresh(){
    this.server.getConversation(this.order.phone)
  }

  close(){
    this.dialogRef.close();
  }
}
