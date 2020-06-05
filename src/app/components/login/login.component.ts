import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { BackendServerService } from 'src/app/services/backend-server.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {


  @Output()
  switchTab = new EventEmitter<number>();

  constructor(public server: BackendServerService) { }

  ngOnInit(): void {
  }

  login() {
    this.server.login().then(() => {
      this.switchTab.emit(0);
    })
  }

  register() {
    this.server.register().then(() => {
      this.switchTab.emit(0);
    })
  }
}
