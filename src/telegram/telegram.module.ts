import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomSchema } from 'src/room/schemas/room.schemas';
import { TelegramService } from './telegram.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Bridge', schema: RoomSchema }])],
  providers: [TelegramService]
})
export class TelegramModule { }
