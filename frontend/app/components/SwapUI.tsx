"use client";
import { useState } from "react";

export function SwapUI({ market }: { market: string }) {
   // const [amount, setAmount] = useState('');
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [type, setType] = useState<'limit' | 'market'>('limit');

    return (
        <div>
            <p>Market: {market}</p> {/* ✅ Debugging line to check market */}
            <div className="flex flex-col">
                <div className="flex flex-row h-[60px]">
                    <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
                    <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="px-3">
                        <div className="flex flex-row flex-0 gap-5">
                            <LimitButton type={type} setType={setType} />
                            <MarketButton type={type} setType={setType} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LimitButton({ type, setType }: { type: 'limit' | 'market', setType: React.Dispatch<React.SetStateAction<'limit' | 'market'>> }) {
    return <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setType('limit')}>
        <div className={`text-sm font-medium py-1 border-b-2 ${type === 'limit' ? "border-accentBlue text-baseTextHighEmphasis" : "border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"}`}>
            Limit
        </div>
    </div>
}

function MarketButton({ type, setType }: { type: 'limit' | 'market', setType: React.Dispatch<React.SetStateAction<'limit' | 'market'>> }) {
    return  <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setType('market')}>
    <div className={`text-sm font-medium py-1 border-b-2 ${type === 'market' ? "border-accentBlue text-baseTextHighEmphasis" : "border-b-2 border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"} `}>
        Market
    </div>
    </div>
}

function BuyButton({ activeTab, setActiveTab }: { activeTab: 'buy' | 'sell', setActiveTab: React.Dispatch<React.SetStateAction<'buy' | 'sell'>> }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'buy' ? 'border-b-greenBorder bg-greenBackgroundTransparent' : 'border-b-baseBorderMed hover:border-b-baseBorderFocus'}`} onClick={() => setActiveTab('buy')}>
        <p className="text-center text-sm font-semibold text-greenText">
            Buy
        </p>
    </div>
}

function SellButton({ activeTab, setActiveTab }: { activeTab: 'buy' | 'sell', setActiveTab: React.Dispatch<React.SetStateAction<'buy' | 'sell'>> }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'sell' ? 'border-b-redBorder bg-redBackgroundTransparent' : 'border-b-baseBorderMed hover:border-b-baseBorderFocus'}`} onClick={() => setActiveTab('sell')}>
        <p className="text-center text-sm font-semibold text-redText">
            Sell
        </p>
    </div>
}
