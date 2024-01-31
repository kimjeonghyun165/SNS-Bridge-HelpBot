import { LoginService } from './login/login.service';
import { TelegramService } from './telegram/telegram.service';
import { DiscordService } from './discord/discord.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { KakaoTalkService } from './kakao-talk/kakao-talk.service';
import { UDPServer } from '@remote-kakao/core';
import { RoomService } from './room/room.service';

interface KakaoLoginResult {
  client: UDPServer; // YourClientType는 실제 클라이언트의 타입에 맞게 설정
  address: any; // address의 타입은 문자열로 가정
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const roomService = app.get(RoomService)
  const telegramService = app.get(TelegramService);
  const discordService = app.get(DiscordService);
  const kakaoTalkService = app.get(KakaoTalkService);
  const loginService = app.get(LoginService);
  await app.listen(config.port, async () => {
    console.log(`Bridge is listening on port ${config.port}`);
    const telegramClient = await loginService.telegramLogin();
    const discordClient = await loginService.discordLogin();
    const kakaoLoginResult = await loginService.kakaoLogin(config.port) as KakaoLoginResult;
    const kakaoClient = kakaoLoginResult.client;
    roomService.room(kakaoClient);
    let address = kakaoLoginResult.address;
    telegramService.listenForMessage(telegramClient);
    telegramService.listenForChannelMessage(telegramClient);
    discordService.listenForMessage(discordClient);
    telegramService.bridgeTelegramToDiscord(telegramClient, discordClient);
    telegramService.bridgeTelegramToKakaTalk(telegramClient, kakaoClient, address);
    telegramService.bridgeTelegramAnnounceToKakaTalk(telegramClient, kakaoClient, address)
    telegramService.bridgeTelegramToTelegraml(telegramClient);
    discordService.bridgeDiscordToTelegram(discordClient, telegramClient);
    discordService.bridgeKakaotalkToDiscord(discordClient, kakaoClient, address);
    kakaoTalkService.bridgeKakaotalkToDiscord(discordClient, kakaoClient);
    kakaoTalkService.bridgeKakaotalkToTelegram(telegramClient, kakaoClient);
  })
}
bootstrap();

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});
