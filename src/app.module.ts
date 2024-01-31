// src/app.module.ts
import { Module } from '@nestjs/common';
import { LoginModule } from './login/login.module';
import { ConfigModule } from './config/config.module';
import { DiscordModule } from './discord/discord.module';
import { TelegramModule } from './telegram/telegram.module';
import { KakaoTalkModule } from './kakao-talk/kakao-talk.module';
import { ConfigService } from './config/config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModule } from './room/room.module';

const config = new ConfigService();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_API_TOKEN),
    RoomModule,
    LoginModule,
    ConfigModule,
    DiscordModule,
    TelegramModule,
    KakaoTalkModule,
  ],
})
export class AppModule { }
