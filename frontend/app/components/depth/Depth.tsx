"use client";

import { useEffect, useState } from "react";
import { getDepth, getTicker, getTrades } from "../../utils/httpClients";
import type { Ticker } from "@/app/utils/types";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "../../utils/SignalingManager";

// Define proper types for the depth data
interface DepthData {
  bids: [string, string][];
  asks: [string, string][];
}

// interface TickerData {
//   lastPrice: string;
// }

//
/*interface TradeData {
  price: string;
}*/

export function Depth({ market }: { market: string }) {
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const [price, setPrice] = useState<string>("");

  useEffect(() => {
    // Register callback for depth updates
    const callbackFn = (data: DepthData | Partial<Ticker>) => {
      // Ensure the data is of type DepthData
      if ("bids" in data && "asks" in data) {
        console.log("Depth updated:", data);

        // Update bids
        setBids((originalBids) => {
          const updatedBids = updateOrderBook(originalBids, data.bids, "desc");
          return updatedBids;
        });

        // Update asks
        setAsks((originalAsks) => {
          const updatedAsks = updateOrderBook(originalAsks, data.asks, "asc");
          return updatedAsks;
        });
      }
    };

    SignalingManager.getInstance().registerCallback("depth", callbackFn, `DEPTH-${market}`);

    // Subscribe to depth updates
    SignalingManager.getInstance().sendMessage({ method: "SUBSCRIBE", params: [`depth@${market}`] });

    // Fetch initial depth, ticker, and trades data
    const fetchData = async () => {
      try {
        const depthData = await getDepth(market);
        setBids(depthData.bids.sort((a, b) => Number(b[0]) - Number(a[0])));
        setAsks(depthData.asks.sort((a, b) => Number(a[0]) - Number(b[0])));

        const tickerData = await getTicker(market);
        setPrice(tickerData.lastPrice);

        const tradesData = await getTrades(market);
        if (tradesData.length > 0) {
          setPrice(tradesData[0].price);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    // Cleanup on unmount
    return () => {
      SignalingManager.getInstance().sendMessage({ method: "UNSUBSCRIBE", params: [`depth@${market}`] });
      SignalingManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
    };
  }, [market]);

  /**
   * Helper function to update the order book (bids or asks).
   * @param originalData - The current order book data.
   * @param newData - The new data to merge into the order book.
   * @param sortOrder - The order to sort the data ("asc" for asks, "desc" for bids).
   * @returns The updated and sorted order book.
   */
  const updateOrderBook = (
    originalData: [string, string][],
    newData: [string, string][],
    sortOrder: "asc" | "desc"
  ): [string, string][] => {
    const updatedData = [...originalData];

    // Update existing entries
    newData.forEach(([price, amount]) => {
      const index = updatedData.findIndex(([p]) => p === price);
      if (index !== -1) {
        if (Number(amount) === 0) {
          updatedData.splice(index, 1); // Remove if amount is zero
        } else {
          updatedData[index][1] = amount; // Update amount
        }
      } else if (Number(amount) !== 0) {
        updatedData.push([price, amount]); // Add new entry
      }
    });

    // Sort the updated data
    return updatedData.sort((a, b) =>
      sortOrder === "asc" ? Number(a[0]) - Number(b[0]) : Number(b[0]) - Number(a[0])
    );
  };

  return (
    <div>
      <TableHeader />
      {asks.length > 0 && <AskTable asks={asks} />}
      {price && <div className="text-center font-bold py-1">{price}</div>}
      {bids.length > 0 && <BidTable bids={bids} />}
    </div>
  );
}

/**
 * Table header component.
 */
function TableHeader() {
  return (
    <div className="flex justify-between text-xs">
      <div className="text-white">Price</div>
      <div className="text-slate-500">Size</div>
      <div className="text-slate-500">Total</div>
    </div>
  );
}