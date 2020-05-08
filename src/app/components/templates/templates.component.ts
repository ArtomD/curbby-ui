import { Component, OnInit } from '@angular/core';
import { BackendServerService } from 'src/app/services/backend-server.service';
import {Template} from '../../models/template'


@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplatesComponent implements OnInit {


  templates :Template[] = [];


  constructor(public server: BackendServerService) { 
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
  }

  cancel(template: Template){
    template.tempBody = template.body; 
  }
}
