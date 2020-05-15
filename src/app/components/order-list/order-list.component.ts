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
import { CustomerStats } from 'src/app/models/customer-stats';

import * as CanvasJS from '../../libraries/canvasjs.min';
import { GraphData,dataPoints } from 'src/app/models/graph-data';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {


  panelOpenState = false;
  messageTemplateSelected = 0;

  customerStats: CustomerStats;

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
    ////////////////////////////
    this.populateCustomerStats();
    ////////////////////////////
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

  /////////////////////////////////////////

  displayStatTable: boolean = false;
  chart: any;
  RFPAvg: GraphData[] = [];
  RFPLongest: GraphData[] = [];
  RFPCount: GraphData[] = [];
  CWAvg: GraphData[] = [];
  CWLongest: GraphData[] = [];
  CWCount: GraphData[] = [];

  populateCustomerStats(){
    this.displayStatTable = true;
    this.customerStats = <CustomerStats>{};
    this.customerStats.RFP = [];
    this.customerStats.CW = [];
    
    for(let i =0; i< 12;i++){
      let date = new Date();
      date.setHours(date.getHours()-i);
      let avgRFP = Math.floor(Math.random() * 41);
      let avgCW = Math.floor(Math.random() * 41);
      this.customerStats.RFP.push({date:date,amount:Math.floor(Math.random() * 31),average:avgRFP,max:avgRFP+3+Math.floor(Math.random() * 16)});
      this.customerStats.CW.push({date:date,amount:Math.floor(Math.random() * 31),average:avgCW,max:avgCW+3+Math.floor(Math.random() * 16)});
    }

    for(let i =0; i< 12;i++){
      let RFPTimeStr = this.customerStats.RFP[i].date.getHours() + " : " + this.customerStats.RFP[i].date.getMinutes();
      this.RFPAvg.push({label:RFPTimeStr,y:this.customerStats.RFP[i].average});
      this.RFPLongest.push({label:RFPTimeStr,y:this.customerStats.RFP[i].max});
      this.RFPCount.push({label:RFPTimeStr,y:this.customerStats.RFP[i].amount});
      let CWTimeStr = this.customerStats.CW[i].date.getHours() + " : " + this.customerStats.CW[i].date.getMinutes();
      this.CWAvg.push({label:CWTimeStr,y:this.customerStats.CW[i].average});
      this.CWLongest.push({label:CWTimeStr,y:this.customerStats.CW[i].max});
      this.CWCount.push({label:CWTimeStr,y:this.customerStats.CW[i].amount});
    }
    
  }

  showGraph(){
    this.displayTableRFP();
    this.displayTableCW();
    this.displayTableFunnel();
    this.displayTableBar();
  }

  displayTableRFP(){
    console.log(this.RFPCount);
    this.chart = new CanvasJS.Chart("chartContainerRFP", {
      title:{
        text: "Customer Data"
      },
      axisY: {
        title: "Order Count",
        lineColor: "#000",
        tickColor: "#000",
        labelFontColor: "#4F81BC",
        showInLegend: true,
        legendText: "RFP Count",
        gridThickness: 1
      },
      axisY2: {
        gridThickness: 0,
        lineColor: "#C0504E",
        tickColor: "#C0504E",
        labelFontColor: "#C0504E"
      },      
      data: [{
        type: "column",
        dataPoints: this.RFPCount
      }]
    });
    this.chart.render();
    this.createParetoRFP();
  }

  createParetoRFP(){
    var dps = [];
    var yValue, yTotal = 0, yPercent = 0;
  
    for(var i = 0; i < this.chart.data[0].dataPoints.length; i++)
      yTotal += this.chart.data[0].dataPoints[i].y;
  
    for(var i = 0; i < this.chart.data[0].dataPoints.length; i++) {
      yValue = this.chart.data[0].dataPoints[i].y;
      yPercent += (yValue / yTotal * 100);
      dps.push({label: this.chart.data[0].dataPoints[i].label, y: yPercent });
    }
    
    this.chart.addTo("data", {type:"line", axisYType: "secondary", yValueFormatString: "", indexLabel: "{y}", lineColor:"#C44", tickColor:"#C44", indexLabelFontColor: "#C44", dataPoints: this.RFPAvg, showInLegend:true, legendText:"RFP Avg"});
    this.chart.addTo("data", {type:"line", axisYType: "secondary", yValueFormatString: "", indexLabel: "{y}", lineColor:"#4B4", tickColor:"#4B4", indexLabelFontColor: "#4B4", dataPoints: this.RFPLongest, showInLegend:true, legendText:"RFP Longest"});
    this.chart.axisY[0].set("maximum", yTotal, false);
    this.chart.axisY2[0].set("maximum", 70, false );
    this.chart.axisY2[0].set("interval", 10 );
  }

  displayTableCW(){
    console.log(this.RFPCount);
    this.chart = new CanvasJS.Chart("chartContainerCW", {
      title:{
        text: "Customer Data"
      },
      axisY: {
        lineColor: "#000",
        tickColor: "#000",
        labelFontColor: "#4F81BC",
        showInLegend: true,
        legendText: "RFP Count",
        gridThickness: 1
      },
      axisY2: {
        title: "Wait Time",
        gridThickness: 0,
        lineColor: "#C0504E",
        tickColor: "#C0504E",
        labelFontColor: "#C0504E"
      },      
      data: [{
        type: "column",
        dataPoints: this.CWCount
      }]
    });
    this.chart.render();
    this.createParetoCW();
  }

  createParetoCW(){
    var dps = [];
    var yValue, yTotal = 0, yPercent = 0;
  
    for(var i = 0; i < this.chart.data[0].dataPoints.length; i++)
      yTotal += this.chart.data[0].dataPoints[i].y;
  
    for(var i = 0; i < this.chart.data[0].dataPoints.length; i++) {
      yValue = this.chart.data[0].dataPoints[i].y;
      yPercent += (yValue / yTotal * 100);
      dps.push({label: this.chart.data[0].dataPoints[i].label, y: yPercent });
    }
    
    this.chart.addTo("data", {type:"line", axisYType: "secondary", yValueFormatString: "", indexLabel: "{y}", lineColor:"#C44", tickColor:"#C44", indexLabelFontColor: "#C44", dataPoints: this.CWAvg, showInLegend:true, legendText:"CW Avg"});
    this.chart.addTo("data", {type:"line", axisYType: "secondary", yValueFormatString: "", indexLabel: "{y}", lineColor:"#4B4", tickColor:"#4B4", indexLabelFontColor: "#4B4", dataPoints: this.CWLongest, showInLegend:true, legendText:"CW Longest"});
    this.chart.axisY[0].set("maximum", yTotal, false);
    this.chart.axisY2[0].set("maximum", 70, false );
    this.chart.axisY2[0].set("interval", 10 );
  }

  displayTableFunnel(){
    let chart = new CanvasJS.Chart("chartContainerFunnel", {
      animationEnabled: false,
      title:{
        text: "Recruitment Analysis - July 2016"
      },
      data: [{
        type: "funnel",
        indexLabel: "{label} - {y}",
        toolTipContent: "<b>{label}</b>: {y} <b>({percentage}%)</b>",
        neckWidth: 20,
        neckHeight: 0,
        valueRepresents: "area",
        dataPoints: dataPoints
      }]
    });
    //calculatePercentage();
    chart.render();
  }

  calculatePercentage() {
    var dataPoint = this.chart.options.data[0].dataPoints;
    var total = dataPoint[0].y;
    for(var i = 0; i < dataPoint.length; i++) {
      if(i == 0) {
        this.chart.options.data[0].dataPoints[i].percentage = 100;
      } else {
        this.chart.options.data[0].dataPoints[i].percentage = ((dataPoint[i].y / total) * 100).toFixed(2);
      }
    }
  }

  displayTableBar(){
    let chart = new CanvasJS.Chart("chartContainerBar", {
      animationEnabled: false,
      theme: "light2", // "light1", "light2", "dark1", "dark2"
      title:{
        text: "Customer Time Waiting"
      },
      axisY: {
        title: "Customer Count"
      },
      data: [{        
        type: "column",  
        showInLegend: true, 
        legendMarkerColor: "grey",
        legendText: "Minutes waiting",
        dataPoints: dataPoints
      }]
    });
    chart.render();
    
  }
  


  ///////////////////////////////////////


}
