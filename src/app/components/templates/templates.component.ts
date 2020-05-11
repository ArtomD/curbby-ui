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
  allExpanded : boolean = false;

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
    this.allExpanded = true;
  }

  collapseAll(){
    this.accordions.forEach(
      element => element.closeAll()
    )
    this.allExpanded = false;
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
