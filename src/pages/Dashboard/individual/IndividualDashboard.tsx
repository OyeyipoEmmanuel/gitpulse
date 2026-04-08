
import DashboardTopNav from '@/components/navbars/DashboardTopNav'
import IndividualSideNav from './components/IndividualSideNav'

const IndividualDashboard = () => {
  return (
    <main className='flex flex-row w-full '>
      <section className='w-[256px]'>
        <IndividualSideNav />
      </section>

      <section className='w-[calc(100%-256px)]'>
        <DashboardTopNav/>
      </section>
    </main>
  )
}

export default IndividualDashboard