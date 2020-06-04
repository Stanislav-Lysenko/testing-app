import {Injectable} from '@angular/core';
import io from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TakeQuizService {

  socket: any = io(`${environment.baseUrl}/game`);


  constructor() {
    this.socket.on('roomId', roomId =>
      console.log(roomId));
  }

  createGame(quiz, userId) {
    this.socket.emit('createGame', {quiz, userId});
  }

  joinRoom(room, userId, firstName) {
    this.socket.emit('joinGameRoom', {room, userId, firstName});
  }

  startGame() {
    this.socket.emit('gameStarted');
  }
  pushResults(result,userId,userName){
    this.socket.emit("pushResults",result,userId,userName)
 }



}
