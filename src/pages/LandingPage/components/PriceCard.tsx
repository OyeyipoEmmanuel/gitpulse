import { CircleCheckBig, CreditCard, LogIn } from "lucide-react"
import { type PricingData } from "../../../types"
import Button from "./Button"

const datas: PricingData[] = [
    {
        header: "Individual Developer",
        price: 0,
        duration: 0,
        isAvailable: true,
        features: ["Personal Dashboard & Insight", "Unlimited public repo analysis", "Visualized commit history", "PR Performance", "Issue Statistics"]
    },
    {
        header: "Organization",
        price: 6.50,
        duration: 1,
        isAvailable: false,
        features: ["Team wide productivity tracking", "Private repository deep-dives", "Contributor Insight", "SLA & Priority support"]
    },
]

const PriceCard = () => {
    return (
        <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {datas.map((data, idx) => (
                <section className="bg-[#161B22] py-6 px-10 border border-[#22272E] flex flex-col justify-between" key={idx}>
                    <div className="flex flex-col space-y-5 py-4">
                        <h1 className="text-white text-3xl font-semibold">{data.header}</h1>
                        <span className="flex items-end space-x-1">
                            <h3 className="text-6xl font-extrabold text-white">{data.price == 0 ? "Free " : `$${data.price} `}</h3>
                            <p className="text-xl text-[#8B949E] "> / {data.duration == 0 ? "forever" : data.duration == 1 ? "year" : "years"}</p>
                        </span>
                    </div>

                    <div className="flex flex-col space-y-4 py-6">
                        {data.features.map((feature, idx) => (
                            <span className="flex items-center space-x-4 text-[#8B949E] text-lg" key={idx}>
                                <CircleCheckBig color="#238636" strokeWidth={1.5} />
                                <p>{feature}</p>
                            </span>
                        ))}
                    </div>

                    <div>
                        {
                            data.price == 0 ?
                                // if Free, login
                                <Button label="Login with Github" icon={<LogIn color="#ffffff" strokeWidth={1.25} />} bgColor="#238636" textColor="#ffffff" />
                                :
                                <Button label="Checkout Now" icon={<CreditCard color="#ffffff" strokeWidth={1.25} />} bgColor="#30363D" textColor="#ffffff" />
                        }
                        {/* <LogIn color="#ffffff" strokeWidth={1.25} /> */}
                    </div>
                </section>
            ))}
        </main>
    )
}

export default PriceCard