import { Component, OnInit } from '@angular/core';
import {mock_stats} from '../../models/mock_models/stats'
import { Template } from '../../models/template';
import {Subscriber} from '../../models/subscriber'
import { BackendServerService } from 'src/app/services/backend-server.service';
import { EditSubscriberComponent } from './edit-subscriber/edit-subscriber.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  displayedColumns: string[] = ['type', 'current', 'last'];
  dataSource = mock_stats;
  templates :Template[] = [];
  orderConfirm : Template = {id:0,shopId:0,created:new Date(), modified:new Date(), body:"",tempBody:"",name:"",type:""};
  orderRdy : Template = {id:0,shopId:0,created:new Date(), modified:new Date(), body:"",tempBody:"",name:"",type:""};

  subscribers :Subscriber[] = [];
  
  displayedColumnsSubs: string[] = ['name', 'status', 'phone', 'edit'];
  dataSourceSubs;

  constructor(public server: BackendServerService, public dialog: MatDialog) { 
    this.synchTemplateObject();
    this.server.template_dataChange.subscribe(value => {      
      this.synchTemplateObject();
    })
    this.server.subscriber_dataChange.subscribe(value => {      
      this.subscribers = this.server.subscriber_data;
      this.dataSourceSubs =  this.subscribers;
    })

  }

  ngOnInit(): void {

  }

  refresh(){
    this.server.getTemplates();
  }

  synchTemplateObject(){
    this.templates = this.server.template_data;
    if(this.templates && this.templates.length>0){
      this.setTemporaryFields()
    }
    this.orderConfirm = this.templates.filter(x => x.type === "orderConf" )[0];
    this.orderRdy = this.templates.filter(x => x.type === "orderReady" )[0];
  }

  setTemporaryFields(){
    this.templates.forEach(element => {
      element.tempBody = element.body;
    });
  }

  saveConfirm(){
    this.orderConfirm.body = this.orderConfirm.tempBody;
    this.server.saveTemplate(this.orderConfirm.id,this.orderConfirm.body);
  }

  cancelConfirm(){
    this.orderConfirm.tempBody = this.orderConfirm.body; 
  }

  saveRdy(){
    this.orderRdy.body = this.orderRdy.tempBody;
    this.server.saveTemplate(this.orderRdy.id,this.orderRdy.body);
  }

  cancelRdy(){
    this.orderRdy.tempBody = this.orderRdy.body; 
  }

  openModal(element: Subscriber){
    const dialogRef = this.dialog.open(EditSubscriberComponent, {
      width: '250px',
      data:element,
    });
    
  }

}
