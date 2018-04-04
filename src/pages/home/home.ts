import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
// import { Socket } from 'ng-socket-io';
import * as io from 'socket.io-client';
import { SocketIoProvider } from '../../providers/socket-io/socket-io';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  delay: number;
  connect = false;
  socket:any;
  SocketUrl = 'http://192.168.5.111:1880';
  nickname = '';
  chack = false;
  constructor(public navCtrl: NavController, 
    public sio:SocketIoProvider
    // private socket: Socket
  ) 
  {
  
  }
  ionViewWillEnter() {
    setTimeout(() => {
      this.chack = false;
    }, 1000);
    
  }
  onEnter(){
    this.joinChat();
  }

  joinChat() {
    this.socket = io(this.SocketUrl).connect();
    this.sio.socket = this.socket;
    this.socket.emit('connect');
    this.socket.on('connect', (data) => {
      console.log("connect");
      this.socket.emit('add user', this.nickname);
      this.socket.emit('set-nickname', this.nickname);
      this.navCtrl.push('ChatRoomPage', { nickname: this.nickname, socket:this.socket});
      this.chack = true;
      this.connect = false;
    });
    setTimeout(() => {
      if(!this.chack){
        this.connect = true;
      }
    }, 2000);
    // this.socket.connect();
  }

}
