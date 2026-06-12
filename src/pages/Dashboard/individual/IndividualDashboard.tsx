
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import DashboardTopNav from '@/components/navbars/DashboardTopNav'
import IndividualSideNav from './components/IndividualSideNav'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useRepos } from '@/services/useRepos'

const IndividualDashboard = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const params = useParams()
  const { getToken, loading } = useAuthStore()
  const username = params.username ?? ''

  useEffect(() => {
    if (!loading) {
      getToken().then((value) => {
        setToken(value)
      })
    }
  }, [getToken, loading])

  const { hasNextPage, hasPreviousPage, goToNextPage, goToPreviousPage } = useRepos(username, token)

  return (
    <main className='flex flex-row w-full'>
      {/* Spacer for fixed desktop sidebar */}
      <div className='hidden md:block w-[256px] shrink-0' />

      <IndividualSideNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <section className='md:w-[calc(100%-256px)] w-full'>
        <DashboardTopNav
          onMenuToggle={() => setMobileNavOpen((prev) => !prev)}
          onPrevPage={goToPreviousPage}
          onNextPage={goToNextPage}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
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