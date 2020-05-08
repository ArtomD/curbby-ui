import { Component, OnInit, Inject } from '@angular/core';
import {Subscriber} from '../../../models/subscriber'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-subscriber',
  templateUrl: './edit-subscriber.component.html',
  styleUrls: ['./edit-subscriber.component.css']
})
export class EditSubscriberComponent implements OnInit {


  selected: Subscriber;

  constructor(
    public dialogRef: MatDialogRef<EditSubscriberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Subscriber) {
      this.selected = data;
      console.log(data);
    }

  ngOnInit(): void {
  }

  delete(){

  }

  save(){

  }
}
