import { Component, OnInit } from '@angular/core';
import { BackendServerService } from 'src/app/services/backend-server.service';
import { ShopDetails } from 'src/app/models/shop-details';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {

  details: ShopDetails;
  endDate;

  constructor(public server: BackendServerService) {
    this.server.order_dataChange.subscribe(value => {
      this.update();
    });
    this.synchBillingObject();
    this.server.shop_details_dataChange.subscribe(value => {
      this.synchBillingObject();
    })
  }

  ngOnInit(): void {
  }

  synchBillingObject() {
    this.details = this.server.shop_details_data;
    if (this?.details?.billing_plan?.id == 1) {
      this.endDate = new Date(new Date(this?.details?.billingPeriodStart).getTime() + (1000 * 60 * 60 * 24 * 30));
    }
  }

  update() {

  }

}
