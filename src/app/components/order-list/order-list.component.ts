import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Order } from '../../models/order';
import { FormControl, Validators } from '@angular/forms';
import { BackendServerService } from '../../services/backend-server.service'
import { FormBuilder, FormGroup } from '@angular/forms';
import { Template } from 'src/app/models/template';
import { STATUS } from '../../models/status'
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPopupComponent } from '../confirm-popup/confirm-popup.component';
import { MessageWindowComponent } from '../message-window/message-window.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { SMS } from 'src/app/models/sms';
import { timer } from 'rxjs';
import { ORDER_REFRESH_RATE, CONVERSATION_REFRESH_RATE, LIVE_SERVER } from '../../../../settings'
import { phone_regex } from '../../models/regex'

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {


  panelOpenState = false;
  messageTemplateSelected = 0;

  displayedColumns: string[] = ['selected', 'shopifyOrderNumber', 'date', 'status', 'phone', 'name', 'messages'];
  dataSource;
  loaded = 0;
  labelFilterString = "";
  filterForm: FormGroup;
  filterNewMessages: boolean = false;
  filterText : string;
  templates: Template[] = [];

  openMassMessage: boolean = false;
  currentConversationOrder: Order;
  conversationOpen: boolean = false;
  autoUpdate: boolean = false;

  statuses = STATUS;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(public server: BackendServerService, public dialog: MatDialog, private fb: FormBuilder, private _snackBar: MatSnackBar) {
    this.messageTemplateSelected = 0;
    this.server.order_dataChange.subscribe(value => {
      this.update();
      this.filter();
    })
    this.synchTemplateObject();
    this.server.template_dataChange.subscribe(value => {
      this.synchTemplateObject();
    })

    const sourceOrder = timer(ORDER_REFRESH_RATE, ORDER_REFRESH_RATE);
    sourceOrder.subscribe(val => { this.autoRefresh(); });

    const sourceConv = timer(CONVERSATION_REFRESH_RATE, CONVERSATION_REFRESH_RATE);
    sourceConv.subscribe(val => { this.refreshConversation(); });
  }


  toggleMessageDiv() {
    this.openMassMessage = !this.openMassMessage;
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      label: [this.labelFilterString, []],
    });
  }

  synchTemplateObject() {
    this.templates = this.server.template_data;
    this.templates.push({ id: 99, shopId: 0, created: new Date, modified: new Date, body: "", tempBody: "", name: "Other", type: "other", isOpen:false });
    if (this.templates && this.templates.length > 0) {
      this.setTemporaryFields()
    }
  }

  setTemporaryFields() {
    this.templates.forEach(element => {
      element.tempBody = element.body;
    });
  }

  update() {
    let tempOrders: number[] = [];
    this.dataSource?.data?.forEach(element => {
      if (element.selected) {
        tempOrders.push(element.id);
      }
    });
    this.dataSource = new MatTableDataSource(this.server.order_data);
    this.dataSource.data.forEach(element => {
      if (element.conversation.lastInbound >= element.conversation.lastRead) {
        element.newMessageAvaliable = true;
      } else {
        element.newMessageAvaliable = false;
      }
      element.displayDate = new Date(element.created)?.toLocaleDateString();
      if (tempOrders.find(x => x == element.id)) {
        element.selected = true;
      }
      element.invalidPhone = false;
    });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loaded = 1;

    this.dataSource.filterPredicate = (data, filter) => {
      var textToSearch = "";
      for (var key in data) {
        if (data[key] != null)
          textToSearch = textToSearch + data[key];
      }
      textToSearch = textToSearch + this.statuses.filter(x => x.id === data.status)[0]["name"];
      if (this.filterNewMessages) {
        if (data.newMessageAvaliable) {
          return textToSearch.toLowerCase().indexOf(filter) !== -1;
        } else {
          return false;
        }
      } else {
        return textToSearch.toLowerCase().indexOf(filter) !== -1;
      }
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.labelFilterString = filterValue.trim().toLowerCase();
    this.dataSource.data.forEach(element => {
      element.selected = false;
    });
    this.filter();
  }


  filterUnread() {
    
    this.sleep(100).then(() => { 
      if(this.filterNewMessages && !this.labelFilterString){
        this.labelFilterString = ".";
      }
      this.filter()});
  }

  filter() {
    if (this.dataSource.paginator) {
      if (this.autoUpdate) {
        this.autoUpdate = false;
      } else {
        this.dataSource.paginator.firstPage();
      }
    }
    this.dataSource.filter = this.labelFilterString;
  }

  refresh() {
    this.server.getOrders();
    this.server.getTemplates();
  }

  autoRefresh() {
    this.autoUpdate = true;
    this.server.getOrders();
  }

  onChange(order: Order) {
    order.phone = order.phone?.replace(/[^0-9\.]+/g, "");
    if (order.phone.search(phone_regex)==0) {
      order.phone = "+" + order.phone;
      this.server.updateOrders(order);
      order.invalidPhone = false;
    }else{
      order.invalidPhone = true;
      this.openSnackBar("Use 1(555)555-5555 for phone formats.");
      this.sleep(5000).then(() => this._snackBar.dismiss());
    }
  }

  validatePhone(order: Order){
    // if (order.phone.toString().search(phone_regex)==0) {
    //   order.invalidPhone = false;
    // }else{
    //   order.invalidPhone = true;
    // }
  }

  changeStatus(status: number) {

    let amount: number = 0;
    this.dataSource.data.forEach(element => {
      if (element.selected) {
        amount++;
      }
    });

    if (amount > 0) {
      const dialogRef = this.dialog.open(ConfirmPopupComponent, {
        data: "You are changing " + amount + " orders to " + STATUS[status].name + ".",
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          let orders: Order[] = [];
          this.dataSource.data.forEach(element => {
            if (element.selected) {
              element["status"] = status;
              orders.push(element);
            }
          });
          this.openSnackBar("Uploading Data");
          if(LIVE_SERVER){
            this.server.updateBatchOrders(orders).subscribe(value => {
              this.openSnackBar("Upload Complete");
              this.sleep(2000).then(() => this._snackBar.dismiss());
            });
          }else{
            this.sleep(1800).then(() => {this.openSnackBar("Upload Complete"); 
                                         this.sleep(2000).then(() => this._snackBar.dismiss());
                                        });
            
          }
        }
      });
    } else {
      this.openSnackBar("No orders selected.");
      this.sleep(2000).then(() => this._snackBar.dismiss());
    }
  }

  massMessage() {
  
    let amount: number = 0;
    let sms: SMS[] = [];
    this.dataSource.data.forEach(element => {
      if (element.selected) {
        let found = false;
        sms.forEach(inner => {
          if (inner.phone == element.phone) {
            found = true;
          }
        });
        if (!found) {
          amount++;
          sms.push(<SMS>{ message: this.server.template_data[this.messageTemplateSelected]["body"], phone: element.phone, subject: "" })
        }
      }
    });

    if (amount > 0) {
      const dialogRef = this.dialog.open(ConfirmPopupComponent, {
        data: "You are sending a message to " + amount + " customers.",
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.openSnackBar("Sending SMS");
          if(LIVE_SERVER){
            this.server.sendBatchSMS(sms).subscribe(value => {
              this.openSnackBar("Messages Sent");
              this.sleep(2000).then(() => this._snackBar.dismiss());
            });
          }else{
            this.sleep(1800).then(() => {this.openSnackBar("Messages Sent"); 
                                         this.sleep(2000).then(() => this._snackBar.dismiss());
                                        });
            
          }
        }
      });
    } else {
      this.openSnackBar("No orders selected.");
      this.sleep(2000).then(() => this._snackBar.dismiss());
    }
  }

  openSnackBar(message: string) {
    this._snackBar.openFromComponent(SnackbarComponent, {
      data: message
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }



  openConversation(order: Order) {
    this.server.getConversation(order.phone);
    this.currentConversationOrder = order;
    this.conversationOpen = true;
    const dialogRef = this.dialog.open(MessageWindowComponent, {
      data: order,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.server.conversations_data = null;
      this.conversationOpen = false;
    });
  }

  clearSearch(){
    if(this.filterNewMessages){
      this.labelFilterString = ".";
    }else{
      this.labelFilterString = "";
    }
    this.dataSource.filter = this.labelFilterString;
    this.filterText = "";
  }

  deselectAll(){
    this.dataSource.data.forEach(element => {
      element.selected = false;
    });
  }

  refreshConversation() {
    if (this.conversationOpen) {
      this.server.getConversation(this.currentConversationOrder.phone)
    }
  }
  
  cancel(template: Template) {
    template.tempBody = template.body;
  }


}
