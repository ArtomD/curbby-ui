import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { mock_stats } from '../../models/mock_models/stats'
import { Template } from '../../models/template';
import { Subscriber } from '../../models/subscriber'
import { BackendServerService } from 'src/app/services/backend-server.service';
import { EditSubscriberComponent } from './edit-subscriber/edit-subscriber.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPopupComponent } from '../confirm-popup/confirm-popup.component';
import { ShopDetails } from 'src/app/models/shop-details';
import { MatTableDataSource } from '@angular/material/table';
import { Stats } from 'src/app/models/stats';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  displayedColumns: string[] = ['outboundCustomerMessages', 'inboundCustomerMessages', 'forwardedMessages', 'ordersManaged'];
  shop_stats: Stats;
  templates :Template[] = [];
  orderConfirm : Template = {id:0,shopId:0,created:new Date(), modified:new Date(), body:"",tempBody:"",name:"",type:"", isOpen:false};
  orderRdy : Template = {id:0,shopId:0,created:new Date(), modified:new Date(), body:"",tempBody:"",name:"",type:"", isOpen:false};

  shop_details: ShopDetails;

  subscribers: Subscriber[] = [];

  displayedColumnsSubs: string[] = ['name', 'status', 'phone', 'edit', 'delete'];
  dataSourceSubs = new MatTableDataSource<Subscriber>();


  constructor(public server: BackendServerService, public dialog: MatDialog,private changeDetectorRefs: ChangeDetectorRef) { 

    this.synchTemplateObject();
    this.server.template_dataChange.subscribe(value => {
      this.synchTemplateObject();
    })
    this.synchSubscriberObject();
    this.server.subscriber_dataChange.subscribe(value => {
      this.synchSubscriberObject();
    })
    this.synchShopDetailsObject();
    this.server.shop_details_dataChange.subscribe(value => {
      this.synchShopDetailsObject();
    })
    this.synchShopStatsObject();
    this.server.stats_dataChange.subscribe(value => {
      this.synchShopStatsObject();
    })

  }

  ngOnInit(): void {

  }

  refresh() {
    this.server.getTemplates();
    this.server.getSubscribers();
    this.server.getShopDetails();
  }

  synchShopDetailsObject() {
    this.shop_details = this.server.shop_details_data;
  }

  synchSubscriberObject() {
    this.subscribers = this.server.subscriber_data;
    this.dataSourceSubs.data =  this.subscribers;
  }

  synchShopStatsObject() {
    this.shop_stats = this.server.stats_data;
    this.shop_stats.month = new Date(this.shop_stats.currentBillingPeriod?.to).toLocaleString('default', { month: 'long' });
  }

  synchTemplateObject() {
    this.templates = this.server.template_data;
    if (this.templates && this.templates.length > 0) {
      this.setTemporaryFields()
    }
    this.orderConfirm = this.templates.filter(x => x.type === "orderConf")[0];
    this.orderRdy = this.templates.filter(x => x.type === "orderReady")[0];
  }

  setTemporaryFields() {
    this.templates.forEach(element => {
      element.tempBody = element.body;
    });
  }

  saveConfirm() {
    this.orderConfirm.body = this.orderConfirm.tempBody;
    this.server.saveTemplate(this.orderConfirm.id, this.orderConfirm.body);
  }

  cancelConfirm() {
    this.orderConfirm.tempBody = this.orderConfirm.body;
  }

  saveRdy() {
    this.orderRdy.body = this.orderRdy.tempBody;
    this.server.saveTemplate(this.orderRdy.id, this.orderRdy.body);
  }

  cancelRdy() {
    this.orderRdy.tempBody = this.orderRdy.body;
  }

  openModal(element: Subscriber) {
    const dialogRef = this.dialog.open(EditSubscriberComponent, {
      data: element
    });

  }

  create() {
    const dialogRef = this.dialog.open(EditSubscriberComponent, {
      data: <Subscriber>{},
    });
    dialogRef.afterClosed().subscribe(result => {
      this.dataSourceSubs.data = this.subscribers;
    });
  }

  delete(element: Subscriber) {

    const dialogRef = this.dialog.open(ConfirmPopupComponent, {
      data: "Delete subscriber " + element.name + "?",
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.server.deleteSubscriber(element);
        this.subscribers.splice(this.subscribers.findIndex(x => x.id === element.id), 1);
        this.dataSourceSubs.data = this.subscribers;
        this.server.subscriber_data = this.subscribers;
        this.server.subscriber_dataChange.next(this.server.subscriber_data);
        //this.changeDetectorRefs.detectChanges();
      }
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async updateShopDetails() {
    await this.sleep(200);
    this.server.updateShopDetails(this.shop_details);
  }

  async updateSubscriber(element: Subscriber) {
    await this.sleep(200);
    this.server.updateSubscribers(element);
  }

}
