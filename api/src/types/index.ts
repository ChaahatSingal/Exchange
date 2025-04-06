export const CREATE_ORDER="CREATE_ORDER";
export const CANCEL_ORDER="CANCEL_ORDER";
export const GET_DEPTH="GET_DEPTH";
export const ON_RAMP="ON_RAMP";
export const GET_OPEN_ORDER="GET_OPEN_ORDER";
export const GET_BALANCES="GET_BALANCES";
export type MessageFromOrderbook={
    type:"Depth",
    payload:{
        market:string,
        bids:[string,string][],
        asks:[string,string][],
    }
}| {
    type:"ORDER_PLACED",
    payload:{
        orderId:string,
        executedQty:number,
        fills:[
            {
                price:string,
                qty:number,
                tradeid:number
            }
        ]
    }
}|{
    type: "ORDER_CANCELLED",
    payload: {
        orderId: string,
        executedQty: number,
        remainingQty: number
    }
} |{
    type:"OPEN_ORDERS",
    payload:{
        orderId:string,
        executsId:number,
        price:string,
        quantity:string,
        side:"buy" | "sell",
        userId:string
    }[]
}|{
    type:"GET_BALANCES",
    payload:{
        [assest:string]:{
            total:string,
            available:string,
            locked:string
        }
    }
}
