
import { useEffect, useState } from 'react'
import DashboardTopNav from '@/components/navbars/DashboardTopNav'
import IndividualSideNav from './components/IndividualSideNav'
import { Outlet } from 'react-router-dom'

const IndividualDashboard = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  useEffect(() => {
    if (!mobileNavOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [mobileNavOpen])

  return (
    <main className='flex flex-row w-full'>
      {/* Spacer for fixed desktop sidebar */}
      <div className='hidden md:block w-[256px] shrink-0' />

      <IndividualSideNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <section inert={mobileNavOpen ? true : undefined} className='md:w-[calc(100%-256px)] w-full'>
        <DashboardTopNav
          onMenuToggle={() => setMobileNavOpen((prev) => !prev)}
        />

        {/* Pages */}
        <div className=''>
          <Outlet />
        </div>

      </section>
    </main>
  )
}

export default IndividualDashboard
