//types for pricing card
export interface PricingData{
    header:string
    price:number
    duration: number //in unit of month
    isAvailable: boolean
    features: string[]
}