import { Component, OnInit } from '@angular/core';
import { BackendServerService } from 'src/app/services/backend-server.service';
import {Template} from '../../models/template'
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent implements OnInit {


  templates :Template[] = [];


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
