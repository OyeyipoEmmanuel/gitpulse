import Logo from "@/components/ui/Logo"
import { navContent } from "../datas"
import { Link } from "react-router-dom"
import { LogOut } from "lucide-react"
import SelectOrgRepoMenu from "./SelectOrgRepoMenu"


const OrgSidenav = () => {
  return (
    <nav className="max-w-[256px] h-screen bg-[#161B22] flex flex-col justify-between z-50 border-r border-[#2D3239]">

      <section className="w-full p-6 flex flex-col space-y-6">
        {/* Logo */}
        <div>
          <Logo textSize={22} />
        </div>

        {/* Select Repo */}
        <div>
          <SelectOrgRepoMenu/>
        </div>

        {/* Nav Contents */}
        <ul className="flex flex-col space-y-5">
          {navContent.map((each, idx) => (
            <li key={idx}>
              <Link to={each.path}>
                <span className="flex items-center space-x-4 ">
                  {each.icon}
                  <p className="text-[#94A3B8] text-14px">{each.label}</p>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Logout */}
      <section className="border-t border-[#2D3239] p-6 flex items-center space-x-4">
        <LogOut size={20} color="#94A3B8" strokeWidth={1} />
        <p className="text-[#94A388]">Logout</p>
      </section>
    </nav>

  )
}

export default OrgSidenav