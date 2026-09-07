import Logo from "@/components/ui/Logo"
import { navContent } from "../datas"
import { NavLink } from "react-router-dom"
import SignOutButton from "@/components/auth/SignOutButton"
import SelectOrgRepoMenu from "./SelectOrgRepoMenu"
import { X } from "lucide-react"

interface OrgSidenavProps {
  isOpen?: boolean
  onClose?: () => void
  mobileOnly?: boolean
}

const OrgSidenav = ({ isOpen = false, onClose, mobileOnly = false }: OrgSidenavProps) => {
  return (
    <>
    {mobileOnly && <button type="button" aria-label="Close organization menu" tabIndex={isOpen ? 0 : -1}
      className={`fixed inset-0 z-40 bg-black/50 md:hidden ${isOpen ? "block" : "hidden"}`} onClick={onClose} />}
    <nav aria-label="Organization dashboard" aria-hidden={mobileOnly && !isOpen} inert={mobileOnly && !isOpen ? true : undefined}
      className={`${mobileOnly ? `fixed inset-y-0 left-0 z-50 w-[80%] max-w-[256px] md:hidden transition-transform ${isOpen ? "translate-x-0" : "-translate-x-full"}` : "max-w-[256px]"} h-screen bg-[#161B22] flex flex-col justify-between border-r border-[#2D3239]`}>

      {mobileOnly && <button type="button" onClick={onClose} aria-label="Close menu" className="absolute right-4 top-4 text-[#94A3B8] hover:text-white"><X size={20} /></button>}

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
          {navContent.map((each) => (
            <li key={each.path}>
              <NavLink
                to={each.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-4 pl-4 ${isActive ? "border-l-2 border-[#227B34] bg-[#20252C] py-2.5 rounded-sm font-semibold" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {each.icon}
                    <p
                      className={`text-14px ${isActive ? "text-[#227B34]" : "text-[#94A3B8]"
                        }`}
                    >
                      {each.label}
                    </p>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </section>

      {/* Logout */}
      <section className="border-t border-[#2D3239] p-6 flex items-center space-x-4">
        <SignOutButton />
      </section>
    </nav>
    </>

  )
}

export default OrgSidenav
