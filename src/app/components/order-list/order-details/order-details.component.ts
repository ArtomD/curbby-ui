import { Component, OnInit, Inject } from '@angular/core';
import { MessageWindowComponent } from '../message-window/message-window.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {

  order: Order;
  constructor(public dialogRef: MatDialogRef<MessageWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Order) { 
      this.order = data;
    }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close();
  }

  openConversation(){
    this.dialogRef.close("OPEN_CONV");
  }

}
