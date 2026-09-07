import { FluctuationStatus } from "./goldPrice.enum.js";

export type GoldPriceHistory = {
    oldPrice : number;
    newPrice : number;
    oldFluctuationStatus : FluctuationStatus;
    newFluctuationStatus : FluctuationStatus;
    fluctuationPercent : number;
    time : Date;
}