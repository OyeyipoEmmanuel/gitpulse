import Logo from "@/components/ui/Logo"
import { navContent } from "../datas"
import { NavLink } from "react-router-dom"
import { LogOut, X } from "lucide-react"

interface IndividualSideNavProps {
  isOpen?: boolean
  onClose?: () => void
}

const NavLinks = ({ onClose }: { onClose?: () => void }) => (
  <>
    <section className="w-full flex flex-col">
      <div className="px-6 flex items-center justify-center py-3.5">
        <Logo textSize={22} />
      </div>
      <ul className="flex flex-col space-y-5 md:space-y-8 p-6 border-t border-[#23282E]">
        {navContent.map((each, idx) => (
          <li key={idx}>
            <NavLink
              to={each.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-4 ${isActive ? "pl-4 border-l-2 border-[#227B34] bg-[#20252C] py-2.5 rounded-sm font-semibold" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  {each.icon}
                  <p className={`text-14px ${isActive ? "text-[#227B34]" : "text-[#94A3B8]"}`}>
                    {each.label}
                  </p>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </section>

    <section className="border-t border-[#2D3239] p-6 flex items-center space-x-4">
      <LogOut size={20} color="#94A3B8" strokeWidth={1} />
      <p className="text-[#94A388]">Logout</p>
    </section>
  </>
)

const IndividualSideNav = ({ isOpen = false, onClose }: IndividualSideNavProps) => {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden w-[256px] h-screen fixed bg-[#161B22] md:flex flex-col justify-between z-50 border-r border-[#2D3239]">
        <NavLinks />
      </nav>

      {/* Mobile drawer backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Mobile drawer */}
      <nav
        className={`fixed inset-y-0 left-0 z-50 w-[80%] bg-[#161B22] flex flex-col justify-between border-r border-[#2D3239] md:hidden
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>

        <NavLinks onClose={onClose} />
      </nav>
    </>
  )
}

export default IndividualSideNav