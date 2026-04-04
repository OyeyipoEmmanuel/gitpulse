import type { DashboardNavCOntentType } from "@/types";
import { ChartNoAxesColumn, ChartNoAxesCombined, FolderGit, GitBranch, Info, UserRound } from "lucide-react";

export const navContent: DashboardNavCOntentType[] = [
    {
      label: "Profile",
      path:"/profile",
      icon: <UserRound color="#94A3B8" strokeWidth={1} />
    },
    {
      label: "Contributions",
      path:"/contributions",
      icon: <ChartNoAxesColumn size={32} color="#94A3B8" strokeWidth={1.5} />
    },
    {
      label: "Repos",
      path:"/repos",
      icon: <FolderGit size={32} color="#94A3B8" strokeWidth={1} />
    },
    {
      label: "PRs",
      path:"/prs",
      icon: <GitBranch size={32} color="#94A3B8" strokeWidth={1} />
    },
    {
      label: "Issues",
      path:"/issues",
      icon: <Info size={32} color="#94A3B8" strokeWidth={1} />
    },
    {
      label: "Activity",
      path:"/activity",
      icon: <ChartNoAxesCombined size={32} color="#94A3B8" strokeWidth={1} />
    },
  ]