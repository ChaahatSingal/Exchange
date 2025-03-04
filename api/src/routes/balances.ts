import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { GET_BALANCES } from "../types";
export const balanceRouter=Router();
balanceRouter.get("/",async(req,res)=>{
const {userId}=req.query;
if(!userId){
    return res.status(400).json({error:"User id is req"});
}
try{
    const response=await RedisManager.getInstance(),sendAndAwait({
        type:GET_BALANCES,
        data:{userId:userId as string}
    });
    res.json(response.payload);   
}catch(error){
    res.status(500).json({error:"Failed to fetch balance"})
}

})