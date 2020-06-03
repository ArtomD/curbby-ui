import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {

  @Output()
  pageNav = new EventEmitter<number>();

  constructor() { }


  ngOnInit(): void {
  }

  goToPage(index: number) {
    this.pageNav.emit(index);
  }

}
