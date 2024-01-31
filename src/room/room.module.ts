import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomSchema } from './schemas/room.schemas';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Bridge', schema: RoomSchema }]),],
  exports: [RoomService],
  providers: [RoomService],
})
export class RoomModule { }
