import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UDPServer } from '@remote-kakao/core';
import * as dayjs from 'dayjs';
import { Client, TextChannel, EmbedBuilder, Webhook } from 'discord.js';
import { Model } from 'mongoose';
import * as TelegramBot from 'node-telegram-bot-api';
import { Room } from 'src/room/schemas/room.schemas';
import { replyToRoom } from 'src/utils';

const axios = require('axios');

@Injectable()
export class TelegramService {
    constructor(
        @InjectModel('Bridge') private readonly roomModel: Model<Room>,
    ) { }
    async listenForMessage(telegramClient: TelegramBot) {
        try {
            telegramClient.on('message', (message: any) => {
                var output = 'Received Telegram message => ';
                output += '[' + message.chat.title + "/" + message.chat.id + "] "
                output += message.username + " : ";
                output += message.text;
                Logger.verbose(output);

                if (message.text === "!id") {
                    telegramClient.sendMessage(message.chat.id, message.chat.id)
                }
            });
        } catch (error) {
            console.log(error);
        }
    }

    async listenForChannelMessage(telegramClient: TelegramBot) {
        try {
            telegramClient.on('channel_post', (message: any) => {
                var output = 'Received Telegram message => ';
                output += '[' + message.chat.title + "/" + message.chat.id + "] "
                output += message.username + " : ";
                output += message.text;
                Logger.verbose(output);
                if (message.text === "!id") {
                    telegramClient.sendMessage(message.chat.id, message.chat.id)
                }
            });

        } catch (error) {
            console.log(error);
        }
    }

    async bridgeTelegramToDiscord(
        telegramClient: TelegramBot,
        discordClient: Client,
    ) {
        try {
            telegramClient.on('message', async (message: any) => {

                const clientData: Room = await this.roomModel.findOne({ 'telegram.channelId': message.chat.id }).exec();

                if (!clientData || !clientData.discord.channelId || !clientData.discord.guildId || clientData.telegram.option.discord) {
                    return;
                }

                const currentDate = dayjs();
                if (dayjs(clientData.status).isBefore(currentDate)) return;

                if (clientData.telegram.option.link === true) {
                    if (message.text && message.text.includes("http")) return;
                }

                const channel = discordClient.channels.cache.get(clientData.discord.channelId) as TextChannel;

                const webhooks = await channel.fetchWebhooks();
                const firstWebhook = webhooks.find((webhook) => webhook.id === clientData.discord.webhookId);

                if (!firstWebhook) {
                    console.log('no WebhookId');
                    return;
                }

                const nickName =
                    message.from.last_name === undefined
                        ? message.from.first_name
                        : message.from.first_name + message.from.last_name;

                if (message.photo || message.document) {
                    this.sendImageMsgToDiscord(firstWebhook, message, nickName);

                } else if (message.text) {
                    this.sendMessageToDiscord(firstWebhook, message.text, nickName);
                }

            });
        } catch (error) {
            console.log(error);
        }
    }


    async bridgeTelegramToTelegraml(
        telegramClient: TelegramBot,
    ) {
        try {
            telegramClient.on('message', async (message: any) => {

                const clientData: Room = await this.roomModel.findOne({ 'telegram.channelId': message.chat.id }).exec();
                const telegramId = clientData.telegram.othertelegramId
                if (!clientData || !telegramId) return;
                if (!message.text) return;
                const nickName =
                    message.from.last_name === undefined
                        ? message.from.first_name
                        : message.from.first_name + message.from.last_name;



                telegramId.map(async (room) => {
                    if (message.photo || message.document) {
                        const photo = message.photo[message.photo.length - 1].file_id;
                        this.sendImageMsgToTelegram(nickName, photo, telegramClient, room)
                    }
                    else {
                        telegramClient.sendMessage(room, message.text)
                    }

                })



            });
        } catch (error) {
            console.log(error);
        }
    }


    async sendMessageToDiscord(
        webhooks: Webhook,
        message: string,
        nickName: string,
    ) {
        try {
            await webhooks.send({ content: message, username: nickName });
        } catch (error) {
            console.log(error);
        }
    }

    async sendImageMsgToDiscord(
        webhooks: Webhook,
        message: any,
        nickName: string,
    ) {
        try {
            if (message.photo !== undefined) {
                const photo = message.photo[message.photo.length - 1].file_id;
                const imageData = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/getFile?file_id=${photo}`;
                const filepath = await this.getApiData(imageData).then(
                    (res: any) => res.result.file_path,
                );
                const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_TOKEN}/${filepath}`;
                const caption = message.caption !== undefined ? message.caption : null;

                const embed = new EmbedBuilder()
                    .setTitle('텔레그렘 : ' + nickName)
                    .setDescription(caption)
                    .setImage(imageUrl);
                await webhooks.send({
                    content: null,
                    username: nickName,
                    embeds: [embed],
                });
            } else if (message.document !== undefined) {
                const document = message.document.file_id;
                const documentData = `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/getFile?file_id=${document}`;
                const filepath = await this.getApiData(documentData).then(
                    (res: any) => res.result.file_path,
                );
                const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_TOKEN}/${filepath}`;
                const caption = message.caption !== undefined ? message.caption : null;
                const embed = new EmbedBuilder()
                    .setTitle('텔레그렘 : ' + nickName)
                    .setDescription(caption)
                    .setImage(imageUrl);
                await webhooks.send({
                    content: null,
                    username: nickName,
                    embeds: [embed],
                });
            } else {
                console.log(`no image found 404`);
            }
        } catch (error) {
            console.log(error);
        }
    }

    async bridgeTelegramToKakaTalk(
        telegramClient: TelegramBot,
        kakaoClient: UDPServer,
        address: any,
    ) {
        try {
            telegramClient.on('message', async (message: any) => {
                const clientDataArray: Room[] = await this.roomModel.find({ 'telegram.channelId': message.chat.id }).exec();

                if (!clientDataArray.length) {
                    return;
                }

                const currentDate = dayjs();
                clientDataArray.forEach((clientData) => {
                    if (dayjs(clientData.status).isBefore(currentDate)) return;

                    const nickName = (message.from.first_name ? message.from.first_name + " " : "") +
                        (message.from.last_name ? message.from.last_name : "");

                    if (clientData.telegram.option.link === true) {
                        if (message.text && message.text.includes("http")) return;
                    }

                    if (message.photo || message.document) {
                        if (clientData.telegram.option.announce === true) {
                            this.sendImgToKakaTalk(nickName, message, kakaoClient, clientData.kakaoTalk.RoomId, address);
                        }
                    } else if (message.text !== undefined) {
                        this.sendMessageToKakaTalk(nickName, message.text, kakaoClient, clientData.kakaoTalk.RoomId, address);
                    }
                });
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
            var output = '텔레그램 : ' + nickName + '\n' + message;
            await replyToRoom(kakaoClient, output, RoomId, address);
        } catch (error) {
            console.log(error);
        }
    }

    async sendImgToKakaTalk(
        nickName: string,
        message: any,
        kakaoClient: UDPServer,
        RoomId: string,
        address: any,
    ) {
        try {
            let text = message.caption !== undefined ? message.caption : message.text !== undefined ? message.text : ""
            text = text.length > 400 ? text.slice(0, 400) + "...더보기 ↓ ↓" : text
            let output = '텔레그램 : ' + nickName + '\n'
            output += text + '\n\n'
            output += "https://t.me/" + message.chat.username + "/" + message.message_id
            await replyToRoom(kakaoClient, output, RoomId, address);
        } catch (error) {
            console.log(error);
        }
    }

    async getApiData(url: string) {
        const html = await axios.get(url);
        return html.data;
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
                    caption: 'Sender : ' + nickName,
                })
                .then(() => console.log('Image sent to Telegram successfully'))
                .catch((error) =>
                    console.error('Error sending image to Telegram:', error),
                );
        } catch (error) {
            console.log(error);
        }
    }


    async bridgeTelegramAnnounceToKakaTalk(
        telegramClient: TelegramBot,
        kakaoClient: UDPServer,
        address: any,
    ) {

        telegramClient.on('channel_post', async (message: any) => {
            const clientData: Room = await this.roomModel.findOne({ 'telegram.channelId': message.chat.id }).exec();

            if (!clientData || clientData.kakaoTalk.RoomId === null || clientData.telegram.option.kakaoTalk === true) {
                return;
            }

            const currentDate = dayjs();
            if (dayjs(clientData.status).isBefore(currentDate)) return;

            const nickName = message.sender_chat.title

            if (clientData.telegram.option.announce === true) {
                this.sendImgToKakaTalk(nickName, message, kakaoClient, clientData.kakaoTalk.RoomId, address);
            } else return

        })
    }



}






