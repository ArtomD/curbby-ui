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
  windowOpen : boolean = false;
  manualRefresh: boolean = false;
  monthName: string[] = ["January","February","March","April","May","June","July","August","September","October","November","December"];  

  constructor(
    public dialogRef: MatDialogRef<MessageWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Order,
    public server: BackendServerService, private _snackBar: MatSnackBar) {
      this.server.getConversation(data.phone);
      this.order = data;
      this.manualRefresh = true;
      this.synchConversationObject();      
      this.server.conversations_dataChange.subscribe(value => { 
        this.synchConversationObject();
      })
    }

    synchConversationObject(){
      this.conversation = this.server.conversations_data;
      this.conversation.messages.forEach(m =>{ 
          m.created=new Date(m.created); 
          m.displayDate = this.setDate(m.created);
          console.log(m.displayDate);
      } )
      if(this.manualRefresh){
        this.scrollToBottom();
        this.manualRefresh = false;
      }
      
      //this.messages.changes.subscribe(this.scrollToBottom);
    }

  ngOnInit(): void {
    this.sleep(100).then(()=>this.scrollToBottom());
  }

  setDate(date: Date){
    let today = new Date();
    let returnString = "";
    if(today.getFullYear() != date.getFullYear() || today.getDate() != date.getDate()){
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
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
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
                              to: "", from: "", origin: 4, displayDate:this.setDate(new Date)};
    this.conversation.messages.push(tempMsg);
    this.server.conversations_data = this.conversation;
    this.manualRefresh = true;
    this.server.conversations_dataChange.next(this.server.conversations_data);
    this.text = "";
    this.sleep(100).then(()=>this.scrollToBottom());
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

  close(){
    this.dialogRef.close();
  }
}
