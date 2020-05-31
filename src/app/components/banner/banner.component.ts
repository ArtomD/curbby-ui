import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BackendServerService } from 'src/app/services/backend-server.service';
import { ShopDetails } from 'src/app/models/shop-details';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {

  @Output()
  switchTab = new EventEmitter<number>();
  details: ShopDetails;

  constructor(public server: BackendServerService) {
    this.synchBillingObject();
    this.server.shop_details_dataChange.subscribe(value => {
      this.synchBillingObject();
    });
  }

  synchBillingObject() {
    this.details = this.server.shop_details_data;
  }
  ngOnInit(): void {
  }

  goToBilling() {
    this.switchTab.emit(3);
  }

}
