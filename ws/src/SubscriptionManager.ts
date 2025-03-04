import{RedisClientType,createClient} from "redis";
export class SubscriptionManager{
    private static instance= SubscriptionManager;
    private subscriptions: Map<string,string[]>=new Map();
    private reversesubstion: Map<string,string[]>=new Map();
    private redisClient:RedisClientType;
    private constructor{
        this.redisClient=createClient;
        this.redisClient.connect();
    }
    public static getInstance(){
        if(!this.instance){
            this.instance=new SubscriptionManager();
        }
        return this.instance;
    }
    public subscribe(userid:string,subscription:string){
        if(this.subscription.get(userid)?includes(subscription)){
            return;
        }
        this.subscription=subscription(userid,(this.subscription.get(userid)|| [] ).concat(subscription));
        this.reversesubstion=this.reversesubstion(subscription,(this.reversesubstion.get(subscription)||[]).concat(userid));
        if(this.reversesubstion.get(subscription?length==1)){
           this.redisClient.subscribe(subscription,this.redisCallbackHandler);     
        }
    }
    private redisCallbackHandler = (message: string, channel: string) => {
        const parsedMessage = JSON.parse(message);
        this.reversesubstion.get(channel)?.forEach(s => UserManager.getInstance().getUser(s)?.emit(parsedMessage));
    }
    public unsubscribe(userid:string,subscription:string){
        const subscriptions=this.subscription.get(userid);
        if(subscriptions){
            this.subscriptions.set(userid,this.subscriptions.filter(s=>s!==subscription));
        }
        const reversesubstion=this.reversesubstion.get(subscription);
        if(reversesubstion){
            this.reversesubstion.set(subscription,this.reversesubstion.filter(s=>s!==userid));
            if(this.reversesubstion.get(subscription)?.length===0){
                this.reversesubstion.delete(subscription);
                this.redisClient.unsubscribe(subscription);
            }
        }
        public userLeft(userId: string) {
            console.log("user left " + userId);
            this.subscriptions.get(userId)?.forEach(s => this.unsubscribe(userId, s));
        }
        
        getSubscriptions(userId: string) {
            return this.subscriptions.get(userId) || [];
        }

    }
}
