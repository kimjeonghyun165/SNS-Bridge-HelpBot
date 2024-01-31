import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import * as TelegramBot from 'node-telegram-bot-api';
import { UDPServer } from '@remote-kakao/core';

@Injectable()
export class LoginService {
    private readonly config: ConfigService;
    private readonly discordClient: Client;
    private readonly kakaoClient: UDPServer;
    private telegramBot: TelegramBot;
    private readonly Logger = new Logger(LoginService.name);
    ready: boolean;

    constructor(configService: ConfigService) {
        this.kakaoClient = new UDPServer({ serviceName: "stock bot" });
        this.config = configService;
        this.discordClient = new Client({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
            partials: [Partials.Channel],
        });
    }

    async discordLogin() {
        this.discordClient.on('ready', () => {
            this.ready = true;
        })
        await this.discordClient.login(this.config.discordToken);
        this.Logger.log(`Discord Login with handle ${this.discordClient.user.tag}`);
        return this.discordClient;
    }

    async telegramLogin() {
        this.telegramBot = await new TelegramBot(this.config.telegramToken, { polling: true });
        this.Logger.log(`Telegram Login with handle ${this.telegramBot.token}`);
        return this.telegramBot;

    }

    async kakaoLogin(port: number) {
        return new Promise((resolve, reject) => {
            this.kakaoClient.once("message", async (msg) => {
                console.log(msg.room.id + " " + msg.room.name);
                console.log(msg.address);
                resolve({ client: this.kakaoClient, address: msg.address });
            });
            this.kakaoClient.start(port);
        });
    }



}

