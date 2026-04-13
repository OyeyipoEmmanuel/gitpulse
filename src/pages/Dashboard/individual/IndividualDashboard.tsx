
import DashboardTopNav from '@/components/navbars/DashboardTopNav'
import IndividualSideNav from './components/IndividualSideNav'
import IndividualProfile from './pages/IndividualProfile'

const IndividualDashboard = () => {
  return (
    <main className='flex flex-row w-full '>
      <section className='hidden md:block w-[256px]'>
        <IndividualSideNav />
      </section>

      <section className='md:w-[calc(100%-256px)] w-full'>
        <DashboardTopNav />

        {/* Pages */}
        <div className='md:px-4'>
          <IndividualProfile />
        </div>

      </section>
    </main>
  )
}

export default IndividualDashboard