import { Component, OnInit, Inject } from '@angular/core';
import { Subscriber } from '../../../models/subscriber'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BackendServerService } from 'src/app/services/backend-server.service';
import {phone_regex} from '../../../models/regex'

@Component({
  selector: 'app-edit-subscriber',
  templateUrl: './edit-subscriber.component.html',
  styleUrls: ['./edit-subscriber.component.css']
})
export class EditSubscriberComponent implements OnInit {

  selected: Subscriber;
  temp: Subscriber = <Subscriber>{};
  invalidPhone:boolean = false;
  invalidTempPhone:boolean = false;
  invalidName:boolean = false;
  invalidTempName:boolean = false;

  constructor(
    public dialogRef: MatDialogRef<EditSubscriberComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Subscriber,
    public server: BackendServerService) {
    this.selected = data;
    this.temp.id = this.selected.id;
    this.temp.name = this.selected.name;
    this.temp.phone = this.selected.phone;
  }

  ngOnInit(): void {
    this.validateOnStart();
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    if (this.temp.id) {
      this.selected.name = this.temp.name;
      this.selected.phone = this.temp.phone;
      this.server.updateSubscribers(this.selected);
    } else {
      this.server.createSubscriber(this.temp);
      this.server.subscriber_data.push(this.temp);
      this.server.subscriber_dataChange.next(this.server.subscriber_data);
    }
    this.dialogRef.close();
  }

  validateOnStart(){
    if(!this.temp.phone){
      this.invalidTempPhone = true;
    }
    if(!this.temp.name){
      this.invalidTempName = true;
    } 
    this.validateTypingPhone();
    this.validateTypingName();
    
  }

  validatePhone(){
    this.temp.phone = this.temp.phone?.replace(/[^0-9]+/g, "");
    if (this.temp?.phone?.search(phone_regex)==0) {
      this.invalidPhone = false;
    }else{
      this.invalidPhone = true;
    }
  }

  validateTypingPhone(){
    this.temp.phone = this.temp.phone?.replace(/[^0-9]+/g, "");
    if (this.temp?.phone?.search(phone_regex)==0) {
      this.invalidTempPhone = false;
      this.invalidPhone = false;
    }else{
      this.invalidTempPhone = true;
    }
  }

  validateName(){
    if (this.temp?.name?.length>0) {
      this.invalidName = false;
    }else{
      this.invalidName = true;
    }
  }

  validateTypingName(){
    if (this.temp?.name?.length>0) {
      this.invalidTempName = false;
      this.invalidName = false;
    }else{
      this.invalidTempName = true;
    }
  }


}
