import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomSchema } from 'src/room/schemas/room.schemas';
import { KakaoTalkService } from './kakao-talk.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Bridge', schema: RoomSchema }])],
  providers: [KakaoTalkService]
})
export class KakaoTalkModule { }
