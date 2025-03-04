import { WebSocket } from "ws";
import { SubscriptionManager } from "./SubscriptionManager";
import { OutgoingMessage } from "./types/out";
import { IncomingMessage,SUBSCRIBE,UNSUBSCRIBE } from "./types/in";
export class User{
    private id:string;
    private ws: WebSocket;
    constructor(id:string,ws:WebSocket){
        this.id=id;
        this.ws=ws;
        addListener();
    }
        private subscriptions:string[]:[];
        public subscribe(subscription:string){
            this.subscriptions.push(subscription);
        }
        public unsubscribe(subscription:string){
            this.subscriptions=this.subscriptions.filter(s=>s!==subscription);
        }
        emit(message: OutgoingMessage) {
            this.ws.send(JSON.stringify(message));
        }
        public addListner(){
            this.ws.on("message",(message:string)=>{
              const parsedMessage:IncomingMessage=JSON.parse(message);
              if(parsedMessage.method==SUBSCRIBE){
                parsedMessage.params.forEach(s=>SubscriptionManager.getInstance().subscribe(this.id,s));

              }  
              if(parsedMessage.method==UNSUBSCRIBE){
                parsedMessage.params.forEach(s=>SubscriptionManager.getInstance().unsubscribe(this.id,s));
              }
            })
        }
}
/* import { WebSocket } from "ws";
import { User } from "./User";
import { SubscriptionManager } from "./SubscriptionManager";

export class UserManager {
    private static instance: UserManager;
    private users: Map<string, User> = new Map();

    private constructor() {}

    public static getInstance() {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    public addUser(ws: WebSocket) {
        const id = this.getRandomId();
        const user = new User(id, ws);
        this.users.set(id, user);
        this.registerOnClose(ws, id);
        return user;
    }

    private registerOnClose(ws: WebSocket, id: string) {
        ws.on("close", () => {
            this.users.delete(id);
            SubscriptionManager.getInstance().userLeft(id);
        });

        ws.on("error", (err) => {
            console.error(`WebSocket error for user ${id}:`, err);
        });
    }

    public getUser(id: string) {
        return this.users.get(id);
    }

    public removeUser(id: string) {
        if (this.users.has(id)) {
            this.users.delete(id);
            SubscriptionManager.getInstance().userLeft(id);
        }
    }

    private getRandomId(): string {
        let id;
        do {
            id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        } while (this.users.has(id));
        return id;
    }
}
    */
