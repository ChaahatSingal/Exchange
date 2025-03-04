import fs from "fs";
import { RedisManager } from "../RedisManager";
import { ORDER_UPDATE,TRADE_ADDED } from "../types";
import { CANCEL_ORDER,CREATE_ORDER,GET_DEPTH,GET_OPEN_ORDERS,MessageFromApi,ON_RAMP } from "../types/fromApi";
import { Orderbook,Order,Fill } from "./Orderbook";
import { setInterval } from "timers/promises";
import { error } from "console";
export const BASE_CURRENCY="INR";
interface UserBalance{
    [key:string]:{
        available:number;
        locked:number
    }
}
export class Engine{
    private orderbooks:Orderbook[]=[];
    private balances:Map<string,UserBalance>=new Map();
    constructor(){
        let snapshot=null;
        try{
            if(process.env.With_snapshot){
                snapshot=fs.readFileSync("./snapshot.json");
            }

        }
        catch(e){
            console.log(" No snapshot found");
        }
        if(snapshot){
            const snapshotSnapsnhot=JSON.parse(snapshot.toString());
            this.orderbooks=snapshotSnapsnhot.orderbooks.Map((o:any)=>new Orderbook(o.baseAsset,o.bids,o.asks,o.lastTradeId,o.currentPrice));
            this.balances=new Map(snapshotSnapsnhot.balances);
        }else{
            this.orderbooks=[new Orderbook('TATA',[],[],0,0)];
            this.setBaseBalances();
        }
        setInterval(()=>{
            this.saveSnapshot();
        },1000*3);
    }
    saveSnapshot(){
        const snapshotSnapsnhot={
            orderbooks:this.orderbooks.map(o=>o.getSnapshot),
            balances:Array.from(this.balances.entries())
        }
        fs.writeFileSync("./snapshot.json",JSON.stringify(snapshotSnapsnhot));

    }
    process({message,clientId}:{message:MessageFromApi,clientId:string}){
        switch(message.type){
            case CREATE_ORDER:
                try{
                    const{ executedQty,fills,orderId}=this.createOrder(message.data.market,message.data.price,message.data.quantity,message.data.side,message.data.userId);
                    RedisManager.getInstance().sendToApi(clientId,{
                        type:"ORDER_PLACED",
                        payload:{
                            orderId,
                            executedQty,
                            fills
                        }
                    });
                 }catch(e){
                    console.log(e);
                    RedisManager.getInstance().sendToApi(clientId,{
                        type:"ORDER_CANCELLED",
                        payload:{
                            orderId:"",
                            executedQty:0,
                            remainingQty: 0
                        }
                    });
                }
                break;
                case CANCEL_ORDER:
                    try{
                       const orderId=message.data.orderId;
                       const cancelMarket=message.data.market;
                       const cancelorderbook=this.orderbooks.find(o=>o.ticker()===cancelMarket);
                       const quoteAsset=cancelMarket.split("_")[1];
                        if(!cancelorderbook){
                            throw new Error("No orderbook found");
                        }
                        const order=cancelorderbook.asks.find(o=>o.orderId===orderId) || cancelorderbook.bids.find(o=>o.orderId===orderId);
                        if(!order){
                            console.log("No order found");
                            throw new Error(" no ordr found");
                        }
                        if(order.side==="buy"){
                            const price=cancelorderbook.cancelBid(order)
                            const leftQuantity=(order.quantity-order.filled)*price;
                             //@ts-ignore
                             this.balances.get(order.userId)[BASE_CURRENCY].available  +=leftQuantity;
                             //@ts-ignore
                             this.balances.get(order.userId)[BASE_CURRENCY].locked-=leftQuantity;
                            if(price){
                                this.sendUpdatedDepthAt(price.toString(),cancelMarket);
                            }
                        }else{
                            const price = cancelorderbook.cancelAsk(order)
                            const leftQuantity = order.quantity - order.filled;
                            //@ts-ignore
                            this.balances.get(order.userId)[quoteAsset].available += leftQuantity;
                            //@ts-ignore
                            this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;
                            if (price) {
                                this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                            }
                        }
                        RedisManager.getInstance().sendToApi(clientId,{
                            type:"ORDER_CANCELLED",
                            payload:{
                                orderId,
                                executedQty:0,
                                remainingQty:0
                            }
                        });
                    }catch(e){
                        console.log("error while cancelling order",);
                        console.log(e);
                    }
                    break;
                  case GET_OPEN_ORDERS:
                   try{
                    const openorderbook=this.orderbooks.find(o=>o.ticker()===message.data.market);
                    if(!openorderbook){
                       throw new Error("No order book found");
                    }
                    const openOrders=openorderbook.getOpenOrders(message.data.userId);
                    RedisManager.getInstance().sendToApi(clientId,{
                        type:"OPEN_ORDERS",
                        payload:openOrders
                    });

                   } catch(e){
                    console.log(e);
                   }
                   break;
                   case ON_RAMP:
                    const userId=message.data.userId;
                    const amount=Number(message.data.amount);
                    this.onRamp(userId,amount);
                    break;
                    case GET_DEPTH:
                        try{
                            const market=message.data.market;
                            const orderbook=this.orderbooks.find(o=>o.ticker()===market);
                            if(!orderbook){
                                throw new Error("no orderbook found");
                            }
                            RedisManager.getInstance().sendToApi(clientId,{
                                type:"DEPTH",
                                payload:orderbook.getDepth()
                            });
                        }catch(e){
                            console.log(e);
                            RedisManager.getInstance().sendToApi(clientId,{
                                type:"DEPTH",
                                payload:{
                                    bids:[],
                                    asks:[]
                                }
                            });
                        }
                        break;
        }
    }

    sendUpdatedDepthAt(price:string,market:string){
        const orderbook=this.orderbooks.find(o=>o.ticker()===market)
        if(!orderbook){
            return;
        }
        const depth=orderbook.getDepth();
        const updatedBids=depth?.bids.filter(x=>x[0]===price);
        const updatedAsks=depth?.asks.filter(x=>x[0]===price);
        RedisManager.getInstance().publishMessage(`depth@${market}`,{
            stream:`depth@${market}`,
            data:{
                a: updatedAsks.length ? updatedAsks : [[price, "0"]],
                b: updatedBids.length ? updatedBids : [[price, "0"]],
                e: "depth"

            }
    });
    }
    addOrderbook(orderbook:Orderbook){
        this.orderbooks.push(orderbook);
    }
    createOrder(market:string,price:string,quantity:string,side:"buy"|"sell",userId:string ){
        const orderbook=this.orderbooks.find(o=>o.ticker()===market);
        const baseAsset=market.split("_")[0];
        const quoteAsset=market.split("_")[1];
        if(!orderbook){
            throw new Error("No ordeerbook found");

        }
        this.checkAndLockFunds(baseAsset,quoteAsset,side,userId,price,quantity);
        
    }
}
