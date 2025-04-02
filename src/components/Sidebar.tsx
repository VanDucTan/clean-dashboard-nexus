
import React from "react";
import { 
  LayoutDashboard, 
  User, 
  Users, 
  Shield, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  FileType, 
  HelpCircle, 
  History, 
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => {
  return (
    <button
      className={cn("sidebar-item", active && "active")}
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
};

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const Sidebar = ({ activeItem, setActiveItem }: SidebarProps) => {
  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "administrator", label: "Administrator", icon: User },
    { id: "accounts", label: "Accounts", icon: Users },
    { id: "roles", label: "Roles", icon: Shield },
    { id: "recruitment", label: "Recruitment", icon: Briefcase },
    { id: "applies", label: "Applies", icon: FileText },
    { id: "interview", label: "Interview", icon: MessageSquare },
    { id: "rule-assessment", label: "Rule Assessment", icon: FileText },
    { id: "qa", label: "Q&A", icon: HelpCircle },
    { id: "type", label: "Type", icon: FileType },
    { id: "questions", label: "Questions", icon: HelpCircle },
    { id: "history", label: "History", icon: History },
  ];

  return (
    <aside className="h-screen w-56 bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="p-4">
        <h1 className="text-xl font-semibold">Admin Panel</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          />
        ))}
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <SidebarItem 
          icon={LogOut} 
          label="Log Out" 
          onClick={() => console.log("Logging out...")}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
