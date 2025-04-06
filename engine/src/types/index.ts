export const TRADE_ADDED = "TRADE_ADDED";
export const ORDER_UPDATE = "ORDER_UPDATE";


export type MessageFromOrderbook =
    | {
        clientId: string;
        message: {
            type: "DEPTH";
        };
        payload:{
            data: {
                market: string,
            }
         }; // Replace 'any' with the actual type of your depth data
    }
    | {
        type: "OPEN_ORDERS";
        payload: {
            orderId: string;
            executsId: number;
            price: string;
            quantity: string;
            side: "buy" | "sell";
            userId: string;
        }[];
    };
