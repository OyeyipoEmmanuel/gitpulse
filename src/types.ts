import type { JSX } from "react"

//types for pricing card
export interface PricingData{
    header:string
    price:number
    duration: number //in unit of month
    isAvailable: boolean
    features: string[]
}

export interface DashboardNavCOntentType{
    label: string
    path:string
    icon: JSX.Element
}