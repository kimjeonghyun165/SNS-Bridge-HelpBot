import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';

@Injectable()
export class ConfigService {
    public readonly discordToken: string;
    public readonly telegramToken: string;
    public readonly mongoToken: string;
    public readonly imgurl: string;
    public readonly port: number;
    constructor() {
        config();
        this.discordToken = process.env.DISCORD_API_TOKEN || '';
        this.telegramToken = process.env.TELEGRAM_API_TOKEN || '';
        this.mongoToken = process.env.MONGODB_API_TOKEN || '';
        this.imgurl = process.env.IMGUR_CLIENT_ID || '';
        this.port = parseInt(process.env.PORT) || 3004;
    }
} 