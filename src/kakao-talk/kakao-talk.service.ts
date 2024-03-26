import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UDPServer } from '@remote-kakao/core';
import * as dayjs from 'dayjs';
import { Client, TextChannel, Webhook } from 'discord.js';
import { Model } from 'mongoose';
import * as TelegramBot from 'node-telegram-bot-api';
import { Room } from 'src/room/schemas/room.schemas';

@Injectable()
export class KakaoTalkService {
    constructor(
        @InjectModel('Bridge') private readonly roomModel: Model<Room>,
    ) { }
    webhook: Webhook;

    async bridgeKakaotalkToDiscord(discordClient: Client, kakaoClient: UDPServer) {
        try {

            kakaoClient.on('message', async (message) => {
                console.log(message.content)
                const clientData: Room = await this.roomModel.findOne({ 'kakaoTalk.RoomId': message.room.id }).exec();
                if (!clientData) return;
                const currentDate = dayjs();
                if (dayjs(clientData.status).isBefore(currentDate)) return;
                if (clientData.discord.channelId === null || clientData.discord.guildId === null) return;
                if (clientData.kakaoTalk.option.discord === true) return;
                if (message.content.includes("Photo") || message.content === "Emoticon" || message.content.includes("Photos")) return;
                const profile = (await message.sender.profileImage).replaceAll("\n", "")
                const profileUrl = await this.imageHosting(discordClient, profile)
                const channel = discordClient.channels.cache.get(clientData.discord.channelId) as TextChannel;
                const webhooks = await channel.fetchWebhooks();
                let firstWebhook = webhooks.find((webhook) => webhook.id === clientData.discord.webhookId);
                if (!firstWebhook) {
                    return console.log("no WebhookId")
                }
                await this.sendMessageToDiscord(firstWebhook, message.content, message.sender.name, profileUrl);
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    async sendMessageToDiscord(webhooks: Webhook, message: string, nickName: string, profile: string) {
        try {

            await webhooks.send({ content: message, username: nickName, avatarURL: profile });

        } catch (error) {
            console.log(error);
        }
    }

    async imageHosting(discordClient: Client, base64Img: string) {
        try {
            const imagediscordChannel = "1156184988212023419";
            const channel = discordClient.channels.cache.get(imagediscordChannel) as TextChannel;
            const messageInfo = await channel.send({
                files: [{
                    attachment: Buffer.from(base64Img, 'base64'), // Base64 데이터를 Buffer로 변환
                    name: 'image.png', // 파일 이름 지정
                }],
            });
            return (messageInfo.attachments.first()).url
        }

        catch (error) {
            console.log(error)
        }
    }



    async bridgeKakaotalkToTelegram(telegramClient: TelegramBot, kakaoClient: UDPServer) {
        try {
            kakaoClient.on('message', async (message) => {
                const clientData: Room = await this.roomModel.findOne({ 'kakaoTalk.RoomId': message.room.id }).exec();
                if (!clientData) return;
                const currentDate = dayjs();
                if (dayjs(clientData.status).isBefore(currentDate)) return;
                if (clientData.telegram.channelId === null) return;
                if (clientData.kakaoTalk.option.telegram === true) return;
                if (message.content === "Photo" || message.content === "Emoticon") return;
                await this.sendMessageToTelegram(message.sender.name, message.content, telegramClient, clientData.telegram.channelId);
            });
        }
        catch (error) {
            console.log(error);
        }
    }

    async sendMessageToTelegram(
        nickName: any,
        message: string,
        telegramBot: TelegramBot,
        telegramChannelId: number,
    ) {
        try {
            var output = '카톡 : ' + nickName + '\n' + message;
            telegramBot.sendMessage(telegramChannelId, output);
        } catch (error) {
            console.log(error);
        }
    }

}
