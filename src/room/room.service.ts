// rooms.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Room } from './schemas/room.schemas';
import { UDPServer } from '@remote-kakao/core';
import * as dayjs from 'dayjs'

@Injectable()
export class RoomService {

    constructor(
        @InjectModel('Bridge') private readonly roomModel: Model<Room>,
    ) { }


    async room(client: UDPServer) {
        client.on("message", async (message) => {
            try {
                if (message.content.startsWith("!방생성 ")) {
                    await this.roomCreate()
                    await message.replyText("생성되었습니다.")
                }

                if (message.content === "!id") {
                    await message.replyText(message.room.id)
                }

            } catch (error) {
                Logger.error(error.message, error.stack);
            }
        });
    }

    async roomCreate(): Promise<Room> {
        const date = dayjs().format("YYYY-MM-DD HH:mm:ss");
        try {
            const defaultRoom: Room = new this.roomModel({
                date: date,
                status: null,
                discord: {
                    guildId: null,
                    channelId: null,
                    option: {
                        telegram: false,
                        kakaoTalk: false,
                        link: false
                    },
                    webhookId: null
                },
                telegram: {
                    channelId: null,
                    option: {
                        discord: false,
                        kakaoTalk: false,
                        link: false,
                        announce: false,
                    },
                    othertelegramId: []
                },
                kakaoTalk: {
                    RoomName: null,
                    RoomId: null,
                    option: {
                        discord: false,
                        telegram: false,
                        link: false
                    }
                },

            });
            return await defaultRoom.save();
        } catch (error) {
            Logger.error(error.message, error.stack);
        }
    }

    async roomFindAll(): Promise<Room[]> {
        return this.roomModel.find().exec();
    }

    async roomFindOne(serialNum: string): Promise<Room | null> {
        try {
            const room = await this.roomModel.findOne({ serialNum }).exec();
            return room;
        } catch (error) {
            Logger.error(error.message, error.stack);
            return null;
        }
    }

    async updateRoom(serialNum: string, updatedFields: Partial<Room>) {
        try {
            const updateQuery = { $set: updatedFields };
            await this.roomModel.updateOne({ serialNum }, updateQuery);
        } catch (error) {
            Logger.error('Error updating user:', error);
        }
    }

}
