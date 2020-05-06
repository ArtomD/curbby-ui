import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';     
import { BackendServerService } from './services/backend-server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-shopify-app';
  constructor(
    private route: ActivatedRoute, private server: BackendServerService
  ) {}

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      //this.server.shop = params["shop"];
      //this.server.signature = params;
      this.server.getOrders();
    });

  }


}
