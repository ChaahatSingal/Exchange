import { Ticker } from "./types";

export const BASE_URL = "ws://localhost:3001";

type MessageType = "ticker" | "depth"; // Define allowed event types

interface DepthUpdate {
    bids: [string, string][]; // Example: [[price, amount], ...]
    asks: [string, string][];
}

type CallbackFunction = (data: Partial<Ticker> | DepthUpdate) => void;

interface CallbackEntry {
    callback: CallbackFunction;
    id: string;
}

export class SignalingManager {
    private ws: WebSocket;
    private static instance: SignalingManager;
    private bufferedMessages: object[] = []; // Instead of `any[]`
    private callbacks: Record<MessageType, CallbackEntry[]> = { ticker: [], depth: [] }; // Typed callbacks
    private id: number;
    private initialized: boolean = false;

    private constructor() {
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessages = [];
        this.id = 1;
        this.init();
    }

    public static getInstance(): SignalingManager {
        if (!this.instance) {
            this.instance = new SignalingManager();
        }
        return this.instance;
    }

    private init() {
        this.ws.onopen = () => {
            this.initialized = true;
            this.bufferedMessages.forEach((message) => {
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const type: MessageType = message.data.e as MessageType; // Ensure it's one of the allowed types

            if (this.callbacks[type]) {
                this.callbacks[type].forEach(({ callback }) => {
                    if (type === "ticker") {
                        const newTicker: Partial<Ticker> = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: message.data.v,
                            quoteVolume: message.data.V,
                            symbol: message.data.s,
                        };
                        console.log(newTicker);
                        callback(newTicker);
                    } else if (type === "depth") {
                        const updatedBids = message.data.b as [string, string][];
                        const updatedAsks = message.data.a as [string, string][];
                        callback({ bids: updatedBids, asks: updatedAsks });
                    }
                });
            }
        };
    }

    sendMessage(message: object) {
        const messageToSend = {
            ...message,
            id: this.id++,
        };
        if (!this.initialized) {
            this.bufferedMessages.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type: MessageType, callback: CallbackFunction, id: string) {
        this.callbacks[type].push({ callback, id });
    }

    async deRegisterCallback(type: MessageType, id: string) {
        if (this.callbacks[type]) {
            this.callbacks[type] = this.callbacks[type].filter((entry) => entry.id !== id);
        }
    }
}
/*import { Ticker } from "./types";

// export const BASE_URL = "wss://ws.backpack.exchange/"
export const BASE_URL = "ws://localhost:3001"

export class SignalingManager {
    private ws: WebSocket;
    private static instance: SignalingManager;
    private bufferedMessages: any[] = [];
    private callbacks: any = {};
    private id: number;
    private initialized: boolean = false;

    private constructor() {
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessages = [];
        this.id = 1;
        this.init();
    }

    public static getInstance() {
        if (!this.instance)  {
            this.instance = new SignalingManager();
        }
        return this.instance;
    }

    init() {
        this.ws.onopen = () => {
            this.initialized = true;
            this.bufferedMessages.forEach(message => {
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        }
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const type = message.data.e;
            if (this.callbacks[type]) {
                this.callbacks[type].forEach(({ callback }) => {
                    if (type === "ticker") {
                        const newTicker: Partial<Ticker> = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: message.data.v,
                            quoteVolume: message.data.V,
                            symbol: message.data.s,
                        }
                        console.log(newTicker);
                        callback(newTicker);
                   }
                   if (type === "depth") {
                        // const newTicker: Partial<Ticker> = {
                        //     lastPrice: message.data.c,
                        //     high: message.data.h,
                        //     low: message.data.l,
                        //     volume: message.data.v,
                        //     quoteVolume: message.data.V,
                        //     symbol: message.data.s,
                        // }
                        // console.log(newTicker);
                        // callback(newTicker);
                        const updatedBids = message.data.b;
                        const updatedAsks = message.data.a;
                        callback({ bids: updatedBids, asks: updatedAsks });
                    }
                });
            }
        }
    }

    sendMessage(message: any) {
        const messageToSend = {
            ...message,
            id: this.id++
        }
        if (!this.initialized) {
            this.bufferedMessages.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type: string, callback: any, id: string) {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({ callback, id });
        // "ticker" => callback
    }

    async deRegisterCallback(type: string, id: string) {
        if (this.callbacks[type]) {
            const index = this.callbacks[type].findIndex(callback => callback.id === id);
            if (index !== -1) {
                this.callbacks[type].splice(index, 1);
            }
        }
    }
}
any and callback
*/