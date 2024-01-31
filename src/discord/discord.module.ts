import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomSchema } from 'src/room/schemas/room.schemas';
import { DiscordService } from './discord.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Bridge', schema: RoomSchema }])],
  providers: [DiscordService]
})
export class DiscordModule { }
