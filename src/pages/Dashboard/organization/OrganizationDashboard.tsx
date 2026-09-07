import DashboardTopNav from "@/components/navbars/DashboardTopNav"
import OrgSidenav from "./components/OrgSidenav"
import { Outlet } from "react-router-dom"
import { useEffect, useState } from "react"


const OrganizationDashboard = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  useEffect(() => {
    if (!mobileNavOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => window.removeEventListener("keydown", closeOnEscape)
  }, [mobileNavOpen])
  return (
    <main className='flex flex-row w-full '>
      <section className='hidden md:block w-[256px]'>
        <OrgSidenav />
      </section>

      <section inert={mobileNavOpen ? true : undefined} className='md:w-[calc(100%-256px)] w-full'>
        <DashboardTopNav onMenuToggle={() => setMobileNavOpen(open => !open)} />
        <OrgSidenav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} mobileOnly />

        {/* Pages */}
        <div className='md:px-4'>
          <Outlet />
        </div>

      </section>
    </main>
  )
}

export default OrganizationDashboard
