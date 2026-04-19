import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

interface DashboardTopNavProps {
  onMenuToggle?: () => void;
}

const DashboardTopNav = ({ onMenuToggle }: DashboardTopNavProps) => {
  const [label, setLabel] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    setLabel(parts[parts.length - 1]);
  }, [location.pathname]);

  return (
    <div className="sticky top-0 z-30 bg-[#11151C] border-b border-[#191D24] p-4 flex items-center gap-3">
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="md:hidden text-[#94A3B8] hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      )}
      <p className="font-semibold text-white text-xl capitalize">{label}</p>
    </div>
  );
};

export default DashboardTopNav;