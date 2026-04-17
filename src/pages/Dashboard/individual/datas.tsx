import type { DashboardNavCOntentType } from "@/types";
import { UserRound } from "lucide-react";
import { FaCode } from "react-icons/fa6";
import { PiGauge } from "react-icons/pi";
import { IoIosPeople } from "react-icons/io";
import { PiTrendUp } from "react-icons/pi";
import { MdWorkOutline } from "react-icons/md";

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
    label: "Collaborations",
    path: "collaborations",
    icon: <IoIosPeople size={20} color="#94A3B8" />
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