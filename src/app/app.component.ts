import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';     
import { BackendServerService } from './services/backend-server.service';
import {mock_signature} from './models/mock_models/signature'
import {mock_shop} from './models/mock_models/shop'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-shopify-app';
  constructor(
    private route: ActivatedRoute, public server: BackendServerService
  ) {}

  ngOnInit() {

    if(this.server.useShop){
      this.route.queryParams.subscribe(params => {
        this.server.shop = params["shop"];
        this.server.signature = params;
        this.server.getOrders();
        this.server.getTemplates();
        this.server.getSubscribers();
        this.server.getShopDetails();
        this.server.getShopStats();
      });
    }else{
      this.server.shop = mock_shop;
      this.server.signature = mock_signature;
      this.server.getOrders();
      this.server.getTemplates();
      this.server.getSubscribers();
      this.server.getShopDetails();
      this.server.getShopStats();
    }
  }


}
