import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendServerService } from './services/backend-server.service';
import { mock_signature } from './models/mock_models/signature'
import { mock_shop } from './models/mock_models/shop'
import { mock_live_signature } from './models/mock_models/live-signature'
import { mock_live_shop } from './models/mock_models/live-shop'
import { FILE_DAM_PATH, DEV } from '../../settings'
import { MatTabsModule } from '@angular/material/tabs';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-shopify-app';
  imgSrc = FILE_DAM_PATH;
  selectedIndex = 0;

  orders: boolean = false;
  templates: boolean = false;
  settings: boolean = false;
  billing: boolean = false;

  constructor(
    private route: ActivatedRoute, public server: BackendServerService
  ) {
    this.orders = true;
  }

  ngOnInit() {
    this.server.authenticated = true;
    if (this.server.useShop) {
      this.route.queryParams.subscribe(params => {
        this.server.shop = params["shop"];
        this.server.signature = params;
        if (!(this.server.shop?.length > 0)) {
          this.server.authenticated = false;
        } else {
          this.server.authenticated = true;
          this.server.getOrders();
          this.server.getTemplates();
          this.server.getSubscribers();
          this.server.getShopDetails();
          this.server.getShopStats();
          this.server.getPlans();
        }
      });
    } else {
      if (DEV) {
        this.server.shop = mock_shop;
        this.server.signature = mock_signature;
      } else {
        this.server.shop = mock_live_shop;
        this.server.signature = mock_live_signature;
      }
      this.server.getOrders();
      this.server.getTemplates();
      this.server.getSubscribers();
      this.server.getShopDetails();
      this.server.getShopStats();
      this.server.getPlans();
    }
  }

  goToPage(index) {
    console.log(index);
    if (index == 0) {
      this.orders = true; this.templates = false; this.settings = false; this.billing = false;
    } else if (index == 1) {
      this.orders = false; this.templates = true; this.settings = false; this.billing = false;
    } else if (index == 2) {
      this.orders = false; this.templates = false; this.settings = true; this.billing = false;
    } else if (index == 3) {
      this.orders = false; this.templates = false; this.settings = false; this.billing = true;
    }
  }

}
