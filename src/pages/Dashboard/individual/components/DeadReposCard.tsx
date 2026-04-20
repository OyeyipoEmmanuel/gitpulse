import { useState } from "react"
import Card from "./Card"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { TriangleAlert } from "lucide-react"

const PAGE_SIZE = 5

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}months ago`
  return `${Math.floor(months / 12)}yr ago`
}

interface DeadRepo {
  name: string
  updatedAt: string
  diskUsage: number
}

function formatStorage(kb: number) {
  if (kb < 1024) return `${kb}KB`
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(1)}MB`
  return `${(kb / (1024 * 1024)).toFixed(1)}GB`
}

const DeadReposCard = ({ deadRepos }: { deadRepos: DeadRepo[] }) => {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(deadRepos.length / PAGE_SIZE)
  const totalStorage = deadRepos.reduce((acc, r) => acc + r.diskUsage, 0)

  return (
    <Card className="w-full md:w-[40%] p-5">
      <div>
        <h1 className="text-white font-semibold text-lg">Most Dead Repos</h1>
        <p className="text-graySubtextColor text-xs pt-1">No activity for 6months+</p>
      </div>

      {deadRepos.length == 0 && (
        <div className="py-12 text-[#238636] text-center mx-auto font-semibold text-xl">Not Enough Data.</div>
      )}

      <div className="grid grid-cols-1 gap-3 pt-5">
        {deadRepos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((repo, idx) => (
          <div key={idx} className="border border-[#2C3239] bg-[#0D1117] flex flex-col p-4 gap-1">
            <p className="font-semibold text-white">{repo.name}</p>
            <p className="text-[11px] text-graySubtextColor">Last commit: {timeAgo(repo.updatedAt)}</p>
          </div>
        ))}
      </div>

      {deadRepos.length > PAGE_SIZE && (
        <Pagination className="pt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)) }}
                className={page === 1 ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => { e.preventDefault(); setPage(i + 1) }}
                  className={page === i + 1 ? "bg-[#238636] text-white border-none" : "text-white"}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)) }}
                className={page === totalPages ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {deadRepos.length > 0 && (
        <div className="mt-6 flex flex-col gap-1 bg-[#2A1D24] border border-[#54272C] rounded-md px-4 py-3">
          <span className="flex items-center space-x-2">
              <TriangleAlert size={15} className="text-[#C44440] shrink-0 mt-0.5" />
              <p className="text-[#C44440] font-semibold">Storage Optimization</p>
          </span>
        
          <p className="text-graySubtextColor text-xs">
            Archiving these <span className="font-extrabold">{deadRepos.length} repos</span> could free up <span className="font-extrabold">{formatStorage(totalStorage)}</span> of workspace storage.
          </p>
        </div>
      )}
    </Card>
  )
}

export default DeadReposCard
