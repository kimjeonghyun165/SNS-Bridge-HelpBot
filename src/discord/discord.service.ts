import { Injectable } from '@nestjs/common';
import { Client } from 'discord.js';
import * as TelegramBot from 'node-telegram-bot-api';
import { UDPServer } from '@remote-kakao/core';
import { filterString, replyToRoom } from 'src/utils';
import { Room } from 'src/room/schemas/room.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as dayjs from 'dayjs';

@Injectable()
export class DiscordService {
    constructor(@InjectModel('Bridge') private readonly roomModel: Model<Room>) { }
    telegramBot: TelegramBot;

    async listenForMessage(discordClient: Client) {
        try {
            discordClient.on('messageCreate', (message) => {
                var output = 'Received Discord message : ' + message.content;
            });
        } catch (error) {
            console.log(error);
        }
    }

    async bridgeDiscordToTelegram(
        discordClient: Client,
        telegramClient: TelegramBot,
    ) {
        try {
            discordClient.on('messageCreate', async (message) => {
                const mentionRegex = /<.*>/;
                const clientData: Room = await this.roomModel
                    .findOne({ 'discord.channelId': message.channelId })
                    .exec();

                if (
                    !clientData ||
                    clientData.telegram.channelId === null ||
                    message.author.bot ||
                    clientData.discord.option.telegram
                ) {
                    return;
                }

                const currentDate = dayjs();
                if (dayjs(clientData.status).isBefore(currentDate)) return;

                const content = filterString(message.content, mentionRegex);

                if (clientData.discord.option.link === true) {
                    if (message.content.includes("http")) return;
                }

                if (content === undefined) {
                    return;
                }
                const telegramChannelId = clientData.telegram.channelId;

                if (message.attachments.size > 0) {
                    this.sendImageMsgToTelegram(
                        message.author.username,
                        message.attachments.first().url,
                        telegramClient,
                        telegramChannelId,
                    );
                } else {
                    this.sendMessageToTelegram(
                        message.author.username,
                        content,
                        telegramClient,
                        telegramChannelId,
                    );
                }
            });
        } catch (error) {
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
            var output = 'Discord : ' + nickName + '\n' + message;
            telegramBot.sendMessage(telegramChannelId, output);
        } catch (error) {
            console.log(error);
        }
    }

    async sendImageMsgToTelegram(
        nickName: any,
        imageUrl: string,
        telegramBot: TelegramBot,
        telegramChannelId: number,
    ) {
        try {
            telegramBot
                .sendPhoto(telegramChannelId, imageUrl, {
                    caption: 'Discord : ' + nickName,
                })
                .then(() => console.log('Image sent to Telegram successfully'))
                .catch((error) =>
                    console.error('Error sending image to Telegram:', error),
                );
        } catch (error) {
            console.log(error);
        }
    }

    async bridgeKakaotalkToDiscord(
        discordClient: Client,
        kakaoClient: UDPServer,
        address: any,
    ) {
        try {
            discordClient.on('messageCreate', async (message) => {
                if (message.author.bot) {
                    return;
                }

                const mentionRegex = /<.*>/;
                const clientData: Room = await this.roomModel
                    .findOne({ 'discord.channelId': message.channelId })
                    .exec();

                if (
                    !clientData ||
                    clientData.kakaoTalk.RoomId === null ||
                    clientData.discord.option.kakaoTalk
                ) {
                    return;
                }

                const currentDate = dayjs();
                if (dayjs(clientData.status).isBefore(currentDate)) return;

                if (clientData.discord.option.link === true) {
                    if (message.content.includes("http")) return;
                }

                let content = filterString(message.content, mentionRegex);
                content = clientData.telegram.option.link
                    ? filterString(message.content, 'http')
                    : message.content;

                if (content === undefined) {
                    return;
                }

                if (message.content !== undefined && message.attachments.size === 0) {
                    this.sendMessageToKakaTalk(
                        message.author.username,
                        content,
                        kakaoClient,
                        clientData.kakaoTalk.RoomId,
                        address,
                    );
                }

                if (message.attachments.size > 0) {
                    return;
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    async sendMessageToKakaTalk(
        nickName: string,
        message: string,
        kakaoClient: UDPServer,
        RoomId: string,
        address: any,
    ) {
        try {
            var output = '디코 : ' + nickName + '\n' + message;
            await replyToRoom(kakaoClient, output, RoomId, address);
        } catch (error) {
            console.log(error);
        }
    }

    async sendImageInfo(url: string, image: string) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify({
                    type: 'url',
                    image: image,
                    onlyImage: true,
                    optOg: false,
                }),
                headers: {
                    'x-api-key': '5ca37707-c1b9-43c0-9a9f-196529c8ae6d',
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error! status: ${response.status}`);
            }

            const result0 = await response.json();
            const result = result0.data;
            return result.viewUrl;
        } catch (error) {
            if (error instanceof Error) {
                console.log('error message: ', error.message);
                return error.message;
            } else {
                console.log('unexpected error: ', error);
                return 'An unexpected error occurred';
            }
        }
    }
}
