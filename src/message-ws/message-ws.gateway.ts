import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  //usamos este decorador para tener la informacion de todas las personas conectadas
  @WebSocketServer() webSocketServer: Server;

  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService,
  ) {}
  async handleConnection(client: Socket) {
    //hacemos la validacion del token
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      //! enviamos el payload que nos da el token para registrar un cliente
      //añadimos el await ya que el register client regresa ya una promesa
      await this.messageWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }
    // console.log({ payload });
    // console.log(client.id, 'cliente conectado');

    //enviar mensaje a todas las personas conectadas
    //el emit recibe un identificador y su payload
    this.webSocketServer.emit(
      'clients-updates',
      this.messageWsService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    // console.log(client.id, 'cliente desconectado');
    this.messageWsService.removeClient(client.id);

    //emitimos el evento tambien para desconectar (el mismo evento)
    this.webSocketServer.emit(
      'clients-updates',
      this.messageWsService.getConnectedClients(),
    );
  }

  //al usar este decorador siempre tenemos dos propiedades, el cliente y el payload
  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    //! Emite unicamente al cliente inicial mismo que envió algo
    // client.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message',
    // });
    //! Emitir a todos MENOS al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'no-message',
    // });

    //! Emitir a todos incluyendo al cliente inicial
    this.webSocketServer.emit('message-from-server', {
      //en vez de quemar un nombre, al enviar un mensaje queremos saber el usuario que lo hizo
      fullName: this.messageWsService.getUserFullNameBySocketId(client.id),
      message: payload.message || 'no-message',
    });
  }
}
