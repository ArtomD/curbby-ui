import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {SERVER_URL, ORDER_PATH} from '../models/settings'
import { timer, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendServerService {

  public data: any = [];
  dataChange: Subject<any> = new Subject<any>();
  public signature = {
    "hmac": "28a0c35ba73bc893172537e2e392f70af425606a562d9365fe15d3e4507528ee",
    "locale": "en",
    "session": "17752846312170a1d44c58f261e40b8f58ac326170fdd168fa1b5a146ca5e534",
    "shop":"purple-pencil.myshopify.com",
    "timestamp": "1588637302"
  }
  public shop = "purple-pencil.myshopify.com";

  constructor(private http: HttpClient) {

  }

  getOrders(){
    return new Promise((resolve) => {
      this.http.post(SERVER_URL + ORDER_PATH, {shop:this.shop, order:{},signature:this.signature}, {
        observe: 'response',
        withCredentials: false
      }).subscribe((result) => {
        this.data = result.body;
        this.dataChange.next(this.data);
        resolve();
      }, error => {
        
      })
    });
  }



}
