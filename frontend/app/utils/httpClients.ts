import axios from "axios";
import { Depth, KLine, Ticker, Trade } from "./types";

// const BASE_URL = "https://exchange-proxy.100xdevs.com/api/v1";
const BASE_URL = "http://localhost:3000/api/v1";

export async function getTicker(market: string): Promise<Ticker> {
    const tickers = await getTickers();
    const ticker = tickers.find(t => t.symbol === market);
    if (!ticker) {
        throw new Error(`No ticker found for ${market}`);
    }
    return ticker;
}

export async function getTickers(): Promise<Ticker[]> {
    try {
        const response = await axios.get(`${BASE_URL}/tickers`);
        
        // Check if response.data is an object with specific structure (common API pattern)
        if (response.data) {
            // If it's already an array of Ticker objects
            if (Array.isArray(response.data)) {
                return response.data as Ticker[];
            } 
            // If it's an object with a data property containing an array
            else if (response.data.data && Array.isArray(response.data.data)) {
                return response.data.data as Ticker[];
            } 
            // If it's an object where each property is a ticker
            else if (typeof response.data === 'object' && !Array.isArray(response.data)) {
                // Type guard to ensure we have valid ticker objects
                const tickersArray = Object.values(response.data);
                
                // Validate that each object has the required Ticker properties
                const validTickers = tickersArray.filter((item): item is Ticker => {
                    return item !== null && 
                           typeof item === 'object' && 
                           'symbol' in item &&
                           typeof item.symbol === 'string';
                });
                
                return validTickers;
            }
        }
        
        // If we couldn't extract an array using the above methods, return empty array
        console.error("Invalid tickers response format:", response.data);
        return [];
    } catch (error) {
        console.error("Error fetching tickers:", error);
        return [];
    }
}

export async function getDepth(market: string): Promise<Depth> {
    const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
    return response.data;
}

export async function getTrades(market: string): Promise<Trade[]> {
    const response = await axios.get(`${BASE_URL}/trades?symbol=${market}`);
    return response.data;
}

export async function getKlines(market: string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
    const response = await axios.get(`${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
    const data: KLine[] = response.data;
    return data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
}