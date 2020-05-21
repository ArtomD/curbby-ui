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
import { MessageWindowComponent } from './message-window/message-window.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { SMS } from 'src/app/models/sms';
import { timer } from 'rxjs';
import { environment } from '../../../environments/environment'
import { phone_regex } from '../../models/regex'
import { LIVE_SERVER } from '../../../../settings'
import { phoneValidator } from '../../validators/phone';
import { OrderDetailsComponent } from './order-details/order-details.component';


@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  panelOpenState = false;
  messageTemplateSelected = 0;

  displayedColumns: string[] = ['selected', 'shopifyOrderNumber', 'date', 'status', 'phone', 'lastMessage', 'name', 'location', 'messages', 'details'];
  statusListFC = new FormControl();
  locationListFC = new FormControl();
  locationList: string[] = [];
  selectedLocationList: string[] = [];
  allOrdersSelected: boolean;
  someOrdersSelected: boolean;

  dataSource;
  loaded = 0;
  selectedOrders: number[] = [];
  labelFilterString = "";
  filterForm: FormGroup;
  filterNewMessages: boolean = false;
  filterText: string;
  templates: Template[] = [];

  openMassMessage: boolean = false;
  currentConversationOrder: Order;
  conversationOpen: boolean = false;
  autoUpdate: boolean = false;

  statuses = STATUS;
  selectedStatus = STATUS;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


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

    const sourceOrder = timer(environment.ORDER_REFRESH_RATE, environment.ORDER_REFRESH_RATE);
    sourceOrder.subscribe(val => { this.autoRefresh(); });

    const sourceConv = timer(environment.CONVERSATION_REFRESH_RATE, environment.CONVERSATION_REFRESH_RATE);
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
    this.templates.push({ id: 99, shopId: 0, created: new Date, modified: new Date, body: "", tempBody: "", name: "Other", type: "other", isOpen: false });
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
    let locationListMax = false;
    if (!this.locationListFC.value || this.locationListFC?.value?.length == this.locationList.length) {
      locationListMax = true;
    }
    this.dataSource.data.forEach(element => {
      if (!this.locationList.find(l => l == element.pickupLocation.code)) {
        this.locationList.push(element.pickupLocation.code);
      }
      if (element?.conversation?.lastInbound > element?.conversation?.lastRead) {
        element.newMessageAvaliable = true;
      } else {
        element.newMessageAvaliable = false;
      }
      element.displayDate = new Date(element.created)?.toLocaleDateString();
      if (tempOrders.find(x => x == element.id)) {
        element.selected = true;
      }
      element.invalidPhone = false;
      if (!element.phoneFormControl) {
        element.phoneFormControl = new FormControl('', [
          Validators.required,
          phoneValidator(),
        ]);
      }
    });
    if (locationListMax) {
      this.selectedLocationList.length = 0;
      this.locationList.forEach(element => {
        this.selectedLocationList.push(element);
      });
    }
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loaded = 1;

    this.dataSource.filterPredicate = (data, filter) => {
      var textToSearch = "";
      for (var key in data) {
        if (data[key] != null)
          textToSearch = textToSearch + data[key];
      }
      textToSearch = textToSearch + this.statuses.filter(x => x.id === data.status)[0]["name"] + data?.customer?.first_name + data?.customer?.last_name + data.conversation?.lastInbound;
      if (this.statusListFC.value.find(status => status.id == data.status) && this.locationListFC.value.find(location => location == data.pickupLocation.code)) {
        if (this.filterNewMessages) {
          if (data.newMessageAvaliable) {
            return textToSearch.toLowerCase().indexOf(filter) !== -1;
          } else {
            return false;
          }
        } else {
          return textToSearch.toLowerCase().indexOf(filter) !== -1;
        }
      } else {
        return false;
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
      if (this.filterNewMessages && !this.labelFilterString) {
        this.labelFilterString = ".";
      }
      this.filter()
    });
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

  filterManualUpdate() {
    if (this.labelFilterString == "") {
      this.labelFilterString = ".";
    }
    this.filter();
    let statusFilter = this.server.order_data.filter(value => -1 != this.statusListFC.value.findIndex(status => status.id == value.status));
    let locationFilter = this.server.order_data.filter(value => this.locationListFC.value.includes(value.pickupLocation.code));
    let combinedFilter = statusFilter.filter(value => locationFilter.includes(value));
    this.selectedOrders
    let missing = false;
    let someSelected = false;

    for (let i = 0; i < combinedFilter.length; i++) {
      if (this.selectedOrders.findIndex(s => s == combinedFilter[i].id) == -1) {
        missing = true;
      } else {
        //order seen in set
        this.allOrdersSelected = true;
        someSelected = true;
      }
    }
    if (missing && someSelected) {
      this.someOrdersSelected = true;
    } else {
      if (missing) {
        this.allOrdersSelected = false;
      }
      this.someOrdersSelected = false;
    }
  }


  refresh() {
    this.server.getOrders();
    this.server.getTemplates();
  }

  autoRefresh() {
    this.autoUpdate = true;
    this.server.getOrders();
  }

  updatePhoneField(element: Order, value: string) {
    element.phone = value?.replace(/[^0-9]+/g, "");
  }

  onChange(order: Order) {
    order.phone = order.phone?.replace(/[^0-9]+/g, "");
    if (order.phone.search(phone_regex) == 0) {
      this.server.updateOrders(order);
      order.invalidPhone = false;
    } else {
      order.invalidPhone = true;
    }
  }

  validatePhone(order: Order) {
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
          if (LIVE_SERVER) {
            this.server.updateBatchOrders(orders).subscribe(value => {
              this.openSnackBar("Upload Complete");
              this.sleep(2000).then(() => this._snackBar.dismiss());
            });
          } else {
            this.sleep(1800).then(() => {
              this.openSnackBar("Upload Complete");
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
          if (LIVE_SERVER) {
            this.server.sendBatchSMS(sms).subscribe(value => {
              this.openSnackBar("Messages Sent");
              this.sleep(2000).then(() => this._snackBar.dismiss());
            });
          } else {
            this.sleep(1800).then(() => {
              this.openSnackBar("Messages Sent");
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
    this.currentConversationOrder = order;
    this.conversationOpen = true;
    const dialogRef = this.dialog.open(MessageWindowComponent, {
      data: order,
    });
    dialogRef.afterClosed().subscribe(result => {
      this.server.conversations_data = null;
      this.conversationOpen = false;
      if (result == "OPEN_DETAIL") {
        this.openDetails(order);
      }
    });
  }

  openDetails(order: Order) {
    this.currentConversationOrder = order;
    const dialogRef = this.dialog.open(OrderDetailsComponent, {
      data: order,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == "OPEN_CONV") {
        this.openConversation(order);
      }
    });
  }

  clearSearch() {
    if (this.filterNewMessages) {
      this.labelFilterString = ".";
    } else {
      this.labelFilterString = "";
    }
    this.dataSource.filter = this.labelFilterString;
    this.filterText = "";
  }

  selectRecord(element: Order) {
    this.sleep(100).then(() => {
      if (element.selected) {
        this.selectedOrders.push(element.id);
        if (this.selectedOrders.length == this.server.order_data.length) {
          this.allOrdersSelected = true;
          this.someOrdersSelected = false;
        } else {
          this.someOrdersSelected = true;
        }
      } else {
        this.selectedOrders.splice(this.selectedOrders.findIndex(n => n == element.id), 1);
        this.allOrdersSelected = false;
        if (this.selectedOrders.length == 0) {
          this.someOrdersSelected = false;
        } else {
          this.someOrdersSelected = true;
        }
      }
    });

  }

  selectAllToggle() {
    this.sleep(100).then(() => {
      if (!this.allOrdersSelected || this.someOrdersSelected) {
        this.allOrdersSelected = false;
        this.someOrdersSelected = false;
        this.server.order_data.forEach(element => {
          if (this.statusListFC.value.find(s => s.id == element.status) && this.locationListFC.value.find(l => l == element.pickupLocation.code)) {
            element.selected = false;
            this.selectedOrders.splice(this.selectedOrders.findIndex(n => n == element.id), 1);
          }
        });
      } else {
        this.allOrdersSelected = true;
        this.someOrdersSelected = false;
        this.selectedOrders.length = 0;
        this.server.order_data.forEach(element => {
          if (this.statusListFC.value.find(s => s.id == element.status) && this.locationListFC.value.find(l => l == element.pickupLocation.code)) {
            element.selected = true;
            this.selectedOrders.push(element.id);
          }
        });
      }
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
