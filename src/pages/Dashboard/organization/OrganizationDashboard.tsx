import DashboardTopNav from "@/components/navbars/DashboardTopNav"
import OrgSidenav from "./components/OrgSidenav"
import OrgProfile from "./pages/OrgProfile"


const OrganizationDashboard = () => {
  return (
    <main className='flex flex-row w-full '>
      <section className='hidden md:block w-[256px]'>
        <OrgSidenav />
      </section>

      <section className='md:w-[calc(100%-256px)] w-full'>
        <DashboardTopNav />

        {/* Pages */}
        <div className='md:px-4'>
          <OrgProfile />
        </div>

      </section>
    </main>
  )
}

export default OrganizationDashboard