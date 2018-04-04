import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
// import { Socket } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { SocketIoProvider } from '../../providers/socket-io/socket-io';
import { HomePage } from '../home/home';
// import { Socket } from 'ng-socket-io';
// import * as io from 'socket.io-client';


/**
 * Generated class for the ChatRoomPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat-room',
  templateUrl: 'chat-room.html',
})
export class ChatRoomPage {
  socket:any;
  pop: boolean;
  typingIdx: number;
  TYPING_TIMER_LENGTH = 1000;
  messages = [];
  nickname = '';
  message = '';
  typing = false;
  lastTypingTime:any;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public sio:SocketIoProvider,
    // private socket: Socket, 
    private toastCtrl: ToastController) {

      // this.socket=io('http://192.168.5.222:1880');
      // this.socket.connect();
      this.nickname = this.navParams.get('nickname');
      console.log(this.nickname)
      if(!this.nickname){
        console.log("go to HomePage")
        navCtrl.push(HomePage);
      }
      else{
        this.socket = sio.socket;
        try{
            this.getMessages().subscribe(message => {
            this.messages.push(message);
          });
      
          this.getUsers().subscribe(data => {
            let user = data['user'];
            if (data['event'] === 'left') {
              this.showToast('User left: ' + user);
            } else {
              this.showToast('User joined: ' + user);
            }
          });
        }catch(Expression){
          // console.log(Expression.getMessages())
        }
      }
    }
  onKeyInput(){
    if (!this.typing) {
      this.typing = true;
      this.socket.emit('typing',{ username: this.nickname });
    }
    this.lastTypingTime = (new Date()).getTime();
    // this.socket.emit('typing', { username: this.nickname });
    console.log(this.nickname);
    setTimeout(() => {
      var typingTimer = (new Date()).getTime();
      var timeDiff = typingTimer - this.lastTypingTime;
      if (timeDiff >= this.TYPING_TIMER_LENGTH && this.typing) {
        this.socket.emit('stop typing',{ username: this.nickname });
        this.typing = false;
      }
      // this.socket.emit('stop typing', { username: this.nickname });
    }, this.TYPING_TIMER_LENGTH);
  }
  
  sendMessage() {
    this.socket.emit('new message', this.message);
    this.socket.emit('add-message', { text: this.message });
    this.message = '';
  }
 
  getMessages() {
    let observable = new Observable(observer => {
      this.socket.on('new message', (data) => {
        if(this.messages.length == this.typingIdx && !this.pop){
          this.messages.pop();
          this.pop = true;
        }
        data.from = data.username;
        data.text = data.message;
        data.created = new Date();
        observer.next(data);
        console.log(data);
      });
      this.socket.on('typing', (data) => {
        data.from = data.username;
        data.text = "...";
        data.created = new Date();
        observer.next(data);
        this.typingIdx = this.messages.length;
        this.pop = false;
        console.log(this.messages.length);
      });
      this.socket.on('stop typing', (data) => {
        if(this.messages.length == this.typingIdx && !this.pop){
          this.messages.pop();
          this.pop = true;
        }
        console.log(data);
      });
      this.socket.on('message', (data) => {
        observer.next(data);
        console.log(data);
      });
    })
    return observable;
  }
 
  getUsers() {
    let observable = new Observable(observer => {
      this.socket.on('user joined', (data) => {
        data.user = data.username;
        data.event = "";
        observer.next(data);
        console.log(data);
      });
      this.socket.on('user left', (data) => {
        data.user = data.username;
        data.event = "left";
        observer.next(data);
        console.log(data);
      });
      this.socket.on('users-changed', (data) => {
        observer.next(data);
        console.log(data)
      });
    });
    return observable;
  }
 
  ionViewWillLeave() {
    this.socket.disconnect();
  }
 
  showToast(msg) {
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
  
  ionViewDidLoad() {
    // console.log('ionViewDidLoad ChatRoomPage');
  }
}
