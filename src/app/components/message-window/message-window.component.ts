import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendServerService } from 'src/app/services/backend-server.service';
import { Order } from 'src/app/models/order';
import { Conversation } from '../../models/conversation';
import {SMS} from '../../models/sms'
import { Message } from 'src/app/models/message';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';

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
    public server: BackendServerService, private _snackBar: MatSnackBar) {
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

  async send(){
    let sms: SMS = {message:this.text, phone:this.order.phone.toString(),subject:""};
    let tempMsg : Message = { id: 0, payload: this.text, conversationId: 0, 
                              created: new Date, modified: new Date, awsId: "",
                              to: "", from: "", origin: 4, };
    this.conversation.messages.push(tempMsg);
    this.server.conversations_data = this.conversation;
    this.server.conversations_dataChange.next(this.server.conversations_data);    
    this.server.sendSMS(sms).subscribe((value) => {
      if(value.status!=200){
        this.openSnackBar("Message failed to send");
        this.sleep(3000).then(()=>this._snackBar.dismiss());
      }
      this.sleep(3000).then(()=>this.server.getConversation(this.order.phone));
    });
  }

  openSnackBar(message:string) {
    this._snackBar.openFromComponent(SnackbarComponent, {
      data: message
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  refresh(){
    this.server.getConversation(this.order.phone)
  }

  close(){
    this.dialogRef.close();
  }
}
