import { Component, OnInit, ViewChild, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { BackendServerService } from 'src/app/services/backend-server.service';
import {Template} from '../../models/template'
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatAccordion } from '@angular/material/expansion';


@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent implements OnInit {

  @ViewChildren(MatAccordion) accordions!: QueryList<MatAccordion>;


  templates :Template[] = [];
  someExpanded : boolean = false;

  constructor(public server: BackendServerService, private _snackBar: MatSnackBar) { 
    this.synchTemplateObject();
    this.server.template_dataChange.subscribe(value => {      
      this.synchTemplateObject();
    })
  }

  ngOnInit(): void {
  }

  refresh(){
    this.server.getTemplates();
  }

  expandAll(){
    this.accordions.forEach(
      element => element.openAll()
    )
    this.templates.forEach(element => element.isOpen = true);
    this.someExpanded = true;
  }

  collapseAll(){
    this.accordions.forEach(
      element => element.closeAll()
    )
    this.templates.forEach(element => element.isOpen = false);
    this.someExpanded = false;
  }

  openCheck(template: Template){
    this.someExpanded = true;
    template.isOpen = true;
  }

  checkAllClosed(template: Template){
    let someOpen = false;
    template.isOpen = false;
    this.templates.forEach(element => {     
      if(element.isOpen){
        someOpen = true;
      }
    });
    this.someExpanded = someOpen;
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

  save(template: Template){
    template.body = template.tempBody;
    this.server.saveTemplate(template.id,template.body);
    this.openSnackBar("Template saved.");
    this.sleep(2000).then(()=>this._snackBar.dismiss());

  }

  cancel(template: Template){
    template.tempBody = template.body; 
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  openSnackBar(message:string) {
    this._snackBar.openFromComponent(SnackbarComponent, {
      data: message
      });
    }
  }
