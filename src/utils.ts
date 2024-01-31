import { UDPServer } from "@remote-kakao/core";

export const replyToRoom = async (server: UDPServer, message: any, roomId?: string, address?: any) => {
    try {
        const addressInfo = {
            address: address.address,
            family: 'IPv4',
            port: address.port,
        }

        await console.log(addressInfo)

        await server.sendText(
            addressInfo,
            0,
            'com.kakao.talk',
            roomId,
            message,
            10000,
        ).catch((error) => {
            console.log(error);
        });
    } catch (error) {
        console.log(error);
    }
}


export const filterString = (str: string, pattern: string | RegExp): string => {
    if (typeof pattern === 'string') {
        if (str.includes(pattern)) {
            return;
        } else {
            return str;
        }
    } else if (pattern instanceof RegExp) {
        if (str.match(pattern)) {
            return "";
        } else {
            return str;
        }
    } else {
        throw new Error("Invalid pattern type. Must be string or RegExp.");
    }
}