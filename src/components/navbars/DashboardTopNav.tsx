import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

interface DashboardTopNavProps {
  onMenuToggle?: () => void;
  onPrevPage?: () => void;
  onNextPage?: () => void;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

const DashboardTopNav = ({
  onMenuToggle,
  onPrevPage,
  onNextPage,
  hasPreviousPage,
  hasNextPage,
}: DashboardTopNavProps) => {
  const [label, setLabel] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    setLabel(parts[parts.length - 1]);
  }, [location.pathname]);

  return (
    <div className="sticky top-0 z-50 bg-[#11151C] border-b border-[#191D24] p-4 flex items-center gap-3">
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

      {(onPrevPage || onNextPage) && (
        <div className="ml-auto flex items-center gap-2">
          {onPrevPage && (
            <button
              onClick={onPrevPage}
              disabled={!hasPreviousPage}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/10 transition"
            >
              Previous
            </button>
          )}

          {onNextPage && (
            <button
              onClick={onNextPage}
              disabled={!hasNextPage}
              className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/10 transition"
            >
              Next 100
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardTopNav;