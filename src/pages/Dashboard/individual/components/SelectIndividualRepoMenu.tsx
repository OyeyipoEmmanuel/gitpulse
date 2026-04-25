import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
import { useFetchIndividualRepos } from "@/services/fetchRepos"
import { useState } from "react"
import { useParams } from "react-router-dom"
import type { GithubRepo } from "@/types"

type Selected = {
    name: string;
    desc: string;
    avatar: string
}
const SelectRepoMenu = () => {
    const [selected, setSelected] = useState<Selected>(
        {
            name: "Select Repo",
            desc: "no desc",
            avatar: ""

        }
    )
    const param = useParams()
    

    const { data, isPending, error } = useFetchIndividualRepos(param.username ?? "", "users")
if(isPending) console.log("Pend")
    return (
        <div className="">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="bg-[#0D1117] px-3 py-2 w-full border border-[#292F36] rounded-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 outline-none" disabled={isPending}>
                        {error ? (
                            <p className="text-white text-center">Error</p>
                        ) : isPending ? (
                            <p className="text-white text-center">Loading...</p>
                        ) : (
                            <div className="flex items-center gap-4">
                                {selected.avatar && (
                                    <img src={selected.avatar} className="rounded-sm" width={32} height={32} />
                                )}
                                <span className="flex flex-col text-start gap-y-2">
                                    <p className="text-white capitalize font-semibold ">{selected.name}</p>
                                <p className="text-[#6F7681] text-start text-xs capitalize line-clamp-1">{selected.desc == "no desc" ? "" : selected.desc}</p>
                                </span>
                                
                            </div>
                        )}

                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" className="bg-[#0D1117] text-white border border-[#2D3239]">
                    <DropdownMenuRadioGroup
                        value={selected.name}
                        onValueChange={(name) => {
                            const repo = data.find((r: GithubRepo) => r.name === name)

                            if (repo) setSelected({
                                name: repo.name,
                                desc: repo.description ?? "no desc",
                                avatar: repo.owner.avatar_url
                            })
                        }}>
                        {data && data.map((each: GithubRepo, idx: number) => (
                            <DropdownMenuRadioItem value={each.name} className=" capitalize" key={idx}>{each.name}</DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div >
    )
}

export default SelectRepoMenu