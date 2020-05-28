import { Component, OnInit } from '@angular/core';
import { BackendServerService } from 'src/app/services/backend-server.service';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {

  constructor(public server: BackendServerService) {
    this.server.order_dataChange.subscribe(value => {
      this.update();
    });
    //this.synchBillingObject();
    this.server.template_dataChange.subscribe(value => {
      //this.synchTemplateObject();
    })
  }

  ngOnInit(): void {
  }

  update() {

  }

}
