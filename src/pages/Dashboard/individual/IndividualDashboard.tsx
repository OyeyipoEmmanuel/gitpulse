
import { useState } from 'react'
import DashboardTopNav from '@/components/navbars/DashboardTopNav'
import IndividualSideNav from './components/IndividualSideNav'
import { Outlet } from 'react-router-dom'

const IndividualDashboard = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <main className='flex flex-row w-full'>
      {/* Spacer for fixed desktop sidebar */}
      <div className='hidden md:block w-[256px] shrink-0' />

      <IndividualSideNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <section className='md:w-[calc(100%-256px)] w-full'>
        <DashboardTopNav onMenuToggle={() => setMobileNavOpen(true)} />

        {/* Pages */}
        <div className='md:px-4'>
          <Outlet />
        </div>

      </section>
    </main>
  )
}

export default IndividualDashboard