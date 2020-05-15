import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';     
import { BackendServerService } from './services/backend-server.service';
import {mock_signature} from './models/mock_models/signature'
import {mock_shop} from './models/mock_models/shop'
import {FILE_DAM_PATH} from '../../settings'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-shopify-app';
  imgSrc = FILE_DAM_PATH;
  constructor(
    private route: ActivatedRoute, public server: BackendServerService
  ) {}

  ngOnInit() {
    this.server.authenticated = true;
    if(this.server.useShop){
      this.route.queryParams.subscribe(params => {
        console.log(params);
        this.server.shop = params["shop"];
        this.server.signature = params;
        if(!(this.server.shop?.length > 0) ){
          this.server.authenticated = false;
        }else{
          this.server.getOrders();
          this.server.getTemplates();
          this.server.getSubscribers();
          this.server.getShopDetails();
          this.server.getShopStats();
        }        
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
