import { Component, OnInit, Inject } from '@angular/core';
import {Subscriber} from '../../../models/subscriber'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendServerService } from 'src/app/services/backend-server.service';

@Component({
  selector: 'app-edit-subscriber',
  templateUrl: './edit-subscriber.component.html',
  styleUrls: ['./edit-subscriber.component.css']
})
export class EditSubscriberComponent implements OnInit {


  selected: Subscriber;
  temp: Subscriber = <Subscriber>{};

  constructor(
    public dialogRef: MatDialogRef<EditSubscriberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Subscriber,
    public server: BackendServerService) {
      this.selected = data;
      this.temp.name = this.selected.name;
      this.temp.phone = this.selected.phone;
      console.log(data);
    }

  ngOnInit(): void {
  }

  cancel(){
    this.dialogRef.close();
  }  

  save(){
    if(this.temp.id){
      this.selected.name = this.temp.name;
      this.selected.phone = this.temp.phone;
      this.server.updateSubscribers(this.selected);
      
    }else{
      this.server.createSubscriber(this.temp);
      this.server.subscriber_data.push(this.temp);
      this.server.subscriber_dataChange.next(this.server.subscriber_data);
    }
    this.dialogRef.close();
  }
}
