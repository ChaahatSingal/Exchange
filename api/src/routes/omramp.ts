import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { ON_RAMP } from "../types";
export const onrampRouter=Router();

onrampRouter.post("/", async (req, res) => {
    const { userId, amount, txnId } = req.body;

    if (!userId || !amount || !txnId) {
       res.status(400).json({ error: "userId, amount, and txnId are required" });
    }

    try {
        const response = await RedisManager.getInstance().sendAndAwait({
            type: ON_RAMP,
            data: { userId, amount, txnId }
        });

        res.json({ message: "On-ramp successful", details: response.type});
    } catch (error) {
        res.status(500).json({ error: "On-ramp processing failed" });
    }
});