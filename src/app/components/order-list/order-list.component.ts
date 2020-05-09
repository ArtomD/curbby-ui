import { Component, OnInit,ViewChild  } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Order } from '../../models/order';
import {FormControl, Validators} from '@angular/forms';
import {BackendServerService} from '../../services/backend-server.service'
import { FormBuilder, FormGroup } from '@angular/forms';
import { Template } from 'src/app/models/template';
import {STATUS} from '../../models/status'
import { MatDialog } from '@angular/material/dialog';
import { ConfirmPopupComponent } from '../confirm-popup/confirm-popup.component';
import { element } from 'protractor';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {

  panelOpenState = false;
  
  displayedColumns: string[] = ['selected','shopifyOrderNumber', 'status', 'phone', 'messages'];
  dataSource;
  loaded = 0;
  labelFilterString = "";
  filterForm: FormGroup;

  templates :Template[] = [];

  openMassMessage: boolean = false;

  statuses = STATUS;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(public server: BackendServerService, public dialog: MatDialog, private fb: FormBuilder) { 

    this.server.order_dataChange.subscribe(value => {
      this.update();
      this.filter();
    })
    this.synchTemplateObject();
    this.server.template_dataChange.subscribe(value => {      
      this.synchTemplateObject();
    })
  }

  toggleMessageDiv(){
    this.openMassMessage = !this.openMassMessage;
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      label: [this.labelFilterString, []],
    });
  }

  synchTemplateObject(){
    this.templates = this.server.template_data;
    if(this.templates && this.templates.length>0){
      this.setTemporaryFields()
    }
  }

  setTemporaryFields(){
    this.templates.forEach(element => {
      element.tempBody = element.body;
    });
  }

  update() {
    this.dataSource = new MatTableDataSource(this.server.order_data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loaded = 1;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.labelFilterString = filterValue.trim().toLowerCase();
  }

  filter() {
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
    this.dataSource.filter = this.labelFilterString;
  }

  refresh() {
    this.server.getOrders();
  }

  onChange(order: Order){
    if(/* valid phone*/true){
      this.server.updateOrders(order);
    }
  }

  changeStatus(status: number){

    let amount: number = 0;
    this.dataSource.data.forEach(element => {
      if(element.selected){
        amount++;
      }
    });
   
    if(amount>0){
      const dialogRef = this.dialog.open(ConfirmPopupComponent, {
        width: '400px',
        height: '160px',
        data:"You are changing " + amount + " orders to " + STATUS[status].name+".",
      });

      dialogRef.afterClosed().subscribe(result => {
        if(result){
          let orders :Order[] = [];
          this.dataSource.data.forEach(element => {
            if(element.selected){
              element["status"] = status;
              orders.push(element); 
            }
          });
          this.server.updateBatchOrders(orders);
        }
      });    
    }
  }


/////////////////////////////////////////

  save(template: Template){
    template.body = template.tempBody;
    this.server.saveTemplate(template.id,template.body);
  }

  cancel(template: Template){
    template.tempBody = template.body; 
  }


///////////////////////////////////////


}
