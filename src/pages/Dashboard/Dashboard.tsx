
import { Outlet } from 'react-router-dom'

const Dashboard = () => {
  return (
    <main className="flex flex-col min-h-screen bg-[#0D1117]">
      {/* <Sidenav /> */}
      <section className="flex-1">
        <Outlet /> 
      </section>
    </main>
  )
}

export default Dashboard
