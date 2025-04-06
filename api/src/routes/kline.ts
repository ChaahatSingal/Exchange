import { Client } from 'pg';
import { Router } from "express";
import { RedisManager } from "../RedisManager";

const pgClient = new Client({
    user: 'your_user',
    host: 'localhost',
    database: 'my_database',
    password: 'your_password',
    port: 5432,
});
pgClient.connect();

export const klineRouter = Router();

// Define proper types for the query parameters
interface KlineQueryParams {
    market?: string;
    interval?: string;
    startTime?: string;
    endTime?: string;
}

klineRouter.get("/", async(req, res) => {
    
    const { market, interval, startTime, endTime } = req.query as KlineQueryParams;

    let query;
    switch (interval) {
        case '1m':
            query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case '1h':
            // There appears to be a typo in your original code - using klines_1m for 1h interval
            query = `SELECT * FROM klines_1h WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case '1w':
            query = `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2`;
            break;
        default:
            res.status(400).send('Invalid interval');
            return; // Add return to prevent further execution
    }

    try {
        // Convert string timestamps to Date objects properly
        const startDate = startTime ? new Date(parseInt(startTime) * 1000) : new Date(0);
        const endDate = endTime ? new Date(parseInt(endTime) * 1000) : new Date();
        
        const result = await pgClient.query(query, [startDate, endDate]);
        
        res.json(result.rows.map(x => ({
            close: x.close,
            end: x.bucket,
            high: x.high,
            low: x.low,
            open: x.open,
            quoteVolume: x.quoteVolume,
            start: x.start,
            trades: x.trades,
            volume: x.volume,
        })));
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});