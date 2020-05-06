import { Component, OnInit,ViewChild  } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Order } from '../../models/order';
import {FormControl, Validators} from '@angular/forms';
import {BackendServerService} from '../../services/backend-server.service'
import { FormBuilder, FormGroup } from '@angular/forms';

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
    this.server.dataChange.subscribe(value => {
      this.update();
      this.filter();
      console.log(this.server.data.orders);
    })
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      label: [this.labelFilterString, []],
    });
  }

  update() {
    this.dataSource = new MatTableDataSource(this.server.data.orders);
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

}
