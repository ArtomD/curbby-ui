import { Component, OnInit,ViewChild  } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Order } from '../../models/order';
import {FormControl, Validators} from '@angular/forms';
import {BackendServerService} from '../../services/backend-server.service'
import { FormBuilder, FormGroup } from '@angular/forms';
import { Template } from 'src/app/models/template';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {

  panelOpenState = false;
  
  displayedColumns: string[] = ['shopifyOrderNumber', 'status', 'phone'];
  dataSource;
  loaded = 0;
  labelFilterString = "";
  filterForm: FormGroup;

  templates :Template[] = [];

  openMassMessage: boolean = false;


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;



  active : boolean;
  rfp : boolean;
  complete : boolean;


  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  constructor(public server: BackendServerService, private fb: FormBuilder) { 
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
