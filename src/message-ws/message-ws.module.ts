import { Module } from '@nestjs/common';
import { MessageWsService } from './message-ws.service';
import { MessageWsGateway } from './message-ws.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [MessageWsGateway, MessageWsService],
  imports: [AuthModule], //como en este modulo tenemos exportado el JwtModule, podemos usar el de Auth
})
export class MessageWsModule {}
