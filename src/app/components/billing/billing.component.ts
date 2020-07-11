import { Component, OnInit } from '@angular/core';
import { BackendServerService } from 'src/app/services/backend-server.service';
import { ShopDetails } from 'src/app/models/shop-details';
import { Plan } from 'src/app/models/plan';
import { MatDialog } from '@angular/material/dialog';
import { UpgradePlanWindowComponent } from './upgrade-plan-window/upgrade-plan-window.component';
import { timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Stats } from 'src/app/models/stats';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css']
})
export class BillingComponent implements OnInit {

  details: ShopDetails;
  plans;
  endDate;

  displayedColumns: string[] = ['outboundCustomerMessages', 'inboundCustomerMessages', 'forwardedMessages', 'ordersManaged'];
  shop_stats: Stats;

  constructor(public server: BackendServerService, public dialog: MatDialog) {

    this.synchBillingObject();
    this.server.shop_details_dataChange.subscribe(value => {
      this.synchBillingObject();
    });

    this.server.plan_dataChange.subscribe(value => {
      this.synchPlanObject();
    });

    this.synchShopStatsObject();
    this.server.stats_dataChange.subscribe(value => {
      this.synchShopStatsObject();
    })

    const sourceConv = timer(environment.SHOP_DETAILS_REFRESH_RATE, environment.SHOP_DETAILS_REFRESH_RATE);
    sourceConv.subscribe(val => { this.refreshBilling(); });
  }

  ngOnInit(): void {
  }


  synchShopStatsObject() {
    this.shop_stats = this.server.stats_data;
    this.shop_stats.month = new Date(this.shop_stats.currentBillingPeriod?.to).toLocaleString('default', { month: 'long' });
  }

  synchBillingObject() {
    this.details = this.server.shop_details_data;
    if (this?.details?.billing_plan?.id != 1) {
      this.endDate = new Date(new Date(this?.details?.billingPeriodStart).getTime() + (1000 * 60 * 60 * 24 * 30));
    }
  }

  synchPlanObject() {
    this.plans = this.server.plan_data;
  }

  update() {

  }

  refreshBilling() {
    this.server.getShopDetails();
  }

  refreshShopDetails() {
    this.server.getShopDetails();
  }

  async upgradePlan(plan: Plan) {
    let sentData: any = {};
    sentData.plan = plan;
    sentData.upgrade = plan.fee > this.details.billing_plan.fee;
    const dialogRef = this.dialog.open(UpgradePlanWindowComponent, {
      data: sentData
    });
  }


}
