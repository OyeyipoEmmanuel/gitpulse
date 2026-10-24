import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardTopNavProps {
  onMenuToggle?: () => void;
}

const DashboardTopNav = ({
  onMenuToggle,
}: DashboardTopNavProps) => {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);
  const label = parts[parts.length - 1] ?? "";

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-xl">
      {onMenuToggle && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </Button>
      )}
      <p className="font-semibold text-white text-xl capitalize">{label}</p>

    </div>
  );
};

export default DashboardTopNav;
