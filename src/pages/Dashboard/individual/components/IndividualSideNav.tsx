import Logo from "@/components/ui/Logo"
import SignOutButton from "@/components/auth/SignOutButton"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { NavLink } from "react-router-dom"
import { Settings2 } from "lucide-react"
import { navContent } from "../datas"

interface IndividualSideNavProps {
  isOpen?: boolean
  onClose?: () => void
}

const navLinkClass = ({ isActive }: { isActive: boolean }) => cn(
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
  isActive && "bg-accent text-foreground shadow-sm",
)

const NavLinks = ({ onClose }: { onClose?: () => void }) => (
  <div className="flex h-full flex-col">
    <div className="flex h-20 items-center border-b px-6"><Logo textSize={22} /></div>
    <nav aria-label="Personal dashboard" className="flex-1 overflow-y-auto p-4">
      <p className="px-3 pb-3 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
      <ul className="space-y-1">
        {navContent.map(each => <li key={each.path}><NavLink to={each.path} onClick={onClose} className={navLinkClass}>{each.icon}<span>{each.label}</span></NavLink></li>)}
      </ul>
    </nav>
    <div className="space-y-3 border-t p-4">
      <NavLink to="settings" onClick={onClose} className={navLinkClass}><Settings2 aria-hidden="true" size={19} strokeWidth={1.5} /><span>Settings</span></NavLink>
      <SignOutButton />
    </div>
  </div>
)

export default function IndividualSideNav({ isOpen = false, onClose }: IndividualSideNavProps) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r bg-sidebar text-sidebar-foreground md:block"><NavLinks /></aside>
      <Sheet open={isOpen} onOpenChange={open => { if (!open) onClose?.() }}>
        <SheetContent side="left" className="w-[82%] max-w-72 gap-0 p-0 md:hidden">
          <SheetTitle className="sr-only">Personal dashboard navigation</SheetTitle>
          <NavLinks onClose={onClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}
