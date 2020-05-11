import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {SERVER_URL, GET_ORDER_PATH, UPDATE_ORDER_PATH, UPDATE_BATCH_ORDER_PATH,
        GET_TEMPLATE_PATH, UPDATE_TEMPLATE_PATH,
        GET_SUBSCRIBERS_PATH, UPDATE_SUBSCRIBERS_PATH, CREATE_SUBSCRIBERS_PATH, DELETE_SUBSCRIBERS_PATH,
        GET_SHOP_DETAILS_PATH, UPDATE_SHOP_DETAILS_PATH,
        GET_CONVERSATION_PATH, SEND_SMS_PATH, SEND_BATCH_SMS_PATH, GET_SHOP_STATS_PATH, LIVE_SERVER, LIVE_SHOP} from '../../../settings'
import { timer, Subject } from 'rxjs';
import {mock_order} from '../models/mock_models/order'
import {mock_template} from '../models/mock_models/template'
import {mock_subscriber} from '../models/mock_models/subscriber'
import {mock_shop_details} from '../models/mock_models/shop-details'
import {mock_conversation} from '../models/mock_models/conversation'
import {mock_stats} from '../models/mock_models/stats'
import { Subscriber } from '../models/subscriber';
import { ShopDetails } from '../models/shop-details';
import { Order } from '../models/order';
import { Conversation } from '../models/conversation';
import { SMS } from '../models/sms';

@Injectable({
  providedIn: 'root'
})
export class BackendServerService {

  
  public live : boolean = LIVE_SERVER;
  public useShop : boolean = LIVE_SHOP;

  public order_data: any = [];
  public order_dataChange: Subject<any> = new Subject<any>();

  public template_data: any = [];
  public template_dataChange: Subject<any> = new Subject<any>();

  public subscriber_data: any = [];
  public subscriber_dataChange: Subject<any> = new Subject<any>();

  public shop_details_data: any = {};
  public shop_details_dataChange: Subject<any> = new Subject<any>();

  public conversations_data: any = {};
  public conversations_dataChange: Subject<any> = new Subject<any>();

  public stats_data: any = {};
  public stats_dataChange: Subject<any> = new Subject<any>();


  public signature : any;
  public shop : any;

  constructor(private http: HttpClient) {

  }

  getOrders(){    
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + GET_ORDER_PATH, {shop:this.shop, order_data:{},signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          this.order_data = result.body["orders"];
          this.order_dataChange.next(this.order_data);
          resolve();
        }, error => {        
        })
      });
    }else{
      this.order_data = mock_order.orders;
      this.order_dataChange.next(this.order_data);
      return mock_order;
    }
  }

  updateOrders(order: Order){    
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + UPDATE_ORDER_PATH, {shop:this.shop, order_data:order,signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          resolve();
        }, error => {        
        })
      });
    }else{
      return mock_order;
    }
  }

  updateBatchOrders(orders: Order[]){    
    if(this.live){
      return this.http.post(SERVER_URL + UPDATE_BATCH_ORDER_PATH, {shop:this.shop, order_data:orders,signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        });
    }else{
      //return mock_order;
    }
  }

  getTemplates(){
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + GET_TEMPLATE_PATH, {shop:this.shop, template_data:{},signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          this.template_data = result.body["templates"];
          this.template_dataChange.next(this.template_data);
          resolve();
        }, error => {        
        })
      });
    }else{
      this.template_data = mock_template.templates;
      this.template_dataChange.next(this.template_data);
      return mock_template;
    }
  }

  saveTemplate(id, body){
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + UPDATE_TEMPLATE_PATH, {shop:this.shop, template_data:{id:id, body:body},signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          this.template_data.filter(x => x.id === id)[0]["body"] = body;
          this.template_dataChange.next(this.template_data);
          resolve();
        }, error => {        
        })
      });
    }else{
      this.template_data.filter(x => x.id === id)[0]["body"] = body;
      this.template_dataChange.next(this.template_data);
      return mock_template;
    }
  }

  getSubscribers(){
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + GET_SUBSCRIBERS_PATH, {shop:this.shop, subscriber_data:{},signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          this.subscriber_data = result.body["subscriber"];
          this.subscriber_dataChange.next(this.subscriber_data);
          resolve();
        }, error => {        
        })
      });
    }else{
      this.subscriber_data = mock_subscriber.subscriber;
      this.subscriber_dataChange.next(this.subscriber_data);
      return mock_subscriber;
    }
  }

  updateSubscribers(subscriber: Subscriber){
    if(this.live){
      return new Promise((resolve) => {
        this.http.post(SERVER_URL + UPDATE_SUBSCRIBERS_PATH, {shop:this.shop, subscriber_data:subscriber,signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          resolve();
        }, error => {        
        })
      });
    }else{
    }
  }

  createSubscriber(subscriber: Subscriber){
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + CREATE_SUBSCRIBERS_PATH, {shop:this.shop, subscriber_data:subscriber,signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          resolve();
        }, error => {        
        })
      });
    }else{
    }
  }

  deleteSubscriber(subscriber: Subscriber){
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + DELETE_SUBSCRIBERS_PATH, {shop:this.shop, subscriber_data:subscriber,signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          resolve();
        }, error => {        
        })
      });
    }else{
    }
  }

  getShopDetails(){
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + GET_SHOP_DETAILS_PATH, {shop:this.shop, signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          this.shop_details_data = result.body["shop"];
          this.shop_details_dataChange.next(this.shop_details_data);
          resolve();
        }, error => {        
        })
      });
    }else{
      this.shop_details_data = mock_shop_details.shop;
      this.shop_details_dataChange.next(this.shop_details_data);
      return mock_shop_details;
    }
  }

  updateShopDetails(shop_details: ShopDetails){
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + UPDATE_SHOP_DETAILS_PATH, {shop:this.shop, shop_data:shop_details, signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          this.shop_details_data = result.body["shop"];
          this.shop_details_dataChange.next(this.shop_details_data);
          resolve();
        }, error => {        
        })
      });
    }else{
      this.shop_details_data = mock_shop_details.shop;
      this.shop_details_dataChange.next(this.shop_details_data);
      return mock_shop_details;
    }
  }

  getConversation(phone:string){
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + GET_CONVERSATION_PATH, {shop:this.shop, conversation_data:{phone:phone}, signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          this.conversations_data = result.body["result"];
          this.conversations_dataChange.next(this.conversations_data);
          resolve();
        }, error => {        
        })
      });
    }else{
      this.conversations_data = mock_conversation.result;
      this.conversations_dataChange.next(this.conversations_data);
      return mock_conversation;
    }
  }

  sendSMS(sms: SMS){
    if(this.live){      
      return this.http.post(SERVER_URL + SEND_SMS_PATH, {shop:this.shop, sms:sms, signature:this.signature}, {
        observe: 'response',
        withCredentials: false
      });
    }else{

    }
  }

  sendBatchSMS(sms: SMS[]){

    if(this.live){
      return this.http.post(SERVER_URL + SEND_BATCH_SMS_PATH, {shop:this.shop, sms:sms, signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        });
    }else{
    }
  }

  getShopStats(){
    if(this.live){
      return new Promise((resolve) => {      
        this.http.post(SERVER_URL + GET_SHOP_STATS_PATH, {shop:this.shop, signature:this.signature}, {
          observe: 'response',
          withCredentials: false
        }).subscribe((result) => {
          this.stats_data = result.body["result"];
          this.stats_dataChange.next(this.stats_data);
          resolve();
        }, error => {        
        })
      });
    }else{
      this.stats_data = mock_stats.result;
      this.stats_dataChange.next(this.stats_data);
      return mock_stats;
    }
  }

}

