// src/modules/rooms/schemas/room.schema.ts

import { Schema, Document } from 'mongoose';

interface Discord {
    guildId: string,
    channelId: string,
    option: {
        telegram: boolean
        kakaoTalk: boolean
        link: boolean
    },
    webhookId: string
}

interface Telegram {
    channelId: number
    option: {
        discord: boolean
        kakaoTalk: boolean
        link: boolean
        announce: boolean
    }
    othertelegramId: number[]
}

interface KakaTalk {
    RoomName: string
    RoomId: string
    option: {
        discord: boolean
        telegram: boolean
        link: boolean
    }
}

export interface Room extends Document {
    date: string;
    status: string;
    discord: Discord;
    telegram: Telegram;
    kakaoTalk: KakaTalk;
}

export const RoomSchema = new Schema<Room>(
    {
        date: String,
        status: String, // 수정
        discord: {
            guildId: String,
            channelId: String,
            option: {
                telegram: Boolean,
                kakaoTalk: Boolean,
                link: Boolean
            },
            webhookId: String
        },
        telegram: {
            channelId: Number,
            option: {
                discord: Boolean,
                kakaoTalk: Boolean,
                link: Boolean,
                announce: Boolean
            },
            othertelegramId: [Number]
        },
        kakaoTalk: {
            RoomName: String,
            RoomId: String,
            option: {
                discord: Boolean,
                telegram: Boolean,
                link: Boolean
            }
        }
    },
    { versionKey: false },
);

