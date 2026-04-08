import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DashboardTopNav = () => {
  const [label, setLabel] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    setLabel(parts[parts.length - 1]);
  }, [location.pathname]);

  return (
    <div className="bg-[#11151C] border-b border-[#191D24] p-4">
      <p className="font-semibold text-white text-xl capitalize">{label}</p>
    </div>
  );
};

export default DashboardTopNav;