import type { DashboardNavCOntentType } from "@/types";
import { UserRound } from "lucide-react";
import { FaCode } from "react-icons/fa6";
import { PiGauge } from "react-icons/pi";
import { PiTrendUp } from "react-icons/pi";
import { MdWorkOutline } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";


export const navContent: DashboardNavCOntentType[] = [
  {
    label: "Profile",
    path: "profile",
    icon: <UserRound size={20} color="#94A3B8" strokeWidth={1} />
  },
  {
    label: "Repo Intelligence",
    path: "repo-intelligence",
    icon: <FaCode size={20} color="#94A3B8"  />
  },
  {
    label: "Productivity",
    path: "productivity",
    icon: <PiGauge size={20} color="#94A3B8" />
  },
  {
    label: "Report Card",
    path: "dev-report-card",
    icon: <TbReportAnalytics size={20} color="#94A3B8" />
  },
  {
    label: "Impact Summary",
    path: "impact-summary",
    icon: <PiTrendUp size={20} color="#94A3B8" />
  },
  {
    label: "Career Snapshot",
    path: "career-snapshot",
    icon: <MdWorkOutline size={20} color="#94A3B8" />
  },
]