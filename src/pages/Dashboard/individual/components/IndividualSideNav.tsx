import Logo from "@/components/ui/Logo"


const IndividualSideNav = () => {


  return (
    <nav className="max-w-[256px] h-screen bg-[#161B22] p-3 flex flex-col justify-between z-50">

      <section className="w-full flex flex-col space-y-3">
        <div>
          <Logo textSize={24} />
        </div>
      

        <div>

        </div>
      </section>

      {/* Logout */}
      <section>

      </section>
    </nav>

  )
}

export default IndividualSideNav