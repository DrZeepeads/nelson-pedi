
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Calculator,
  MessageSquare,
  LineChart,
  Home,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

export const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Drug Calculator", href: "/calculator", icon: Calculator },
    { name: "Growth Charts", href: "/growth-charts", icon: LineChart },
  ];

  return (
    <div
      className={cn(
        "border-r bg-sidebar min-h-screen relative transition-all duration-300",
        isOpen ? "w-64" : "w-0"
      )}
    >
      <div className="h-full flex flex-col">
        <div className="space-y-4 py-4">
          <div className="px-3 flex items-center justify-between">
            <h2 className={cn("text-lg font-semibold tracking-tight", !isOpen && "hidden")}>
              Nelson-GPT
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className={cn("lg:flex hidden", !isOpen && "hidden")}
              onClick={() => setIsOpen(false)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1 px-3">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={location.pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  !isOpen && "hidden"
                )}
                asChild
              >
                <Link to={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
