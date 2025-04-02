
import React, { useState } from "react";
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
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  hasChildren?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  hasChildren, 
  expanded, 
  onToggle 
}: SidebarItemProps) => {
  return (
    <button
      className={cn("sidebar-item", active && "active")}
      onClick={onClick || onToggle}
    >
      <Icon size={18} />
      <span className="flex-1">{label}</span>
      {hasChildren && (
        expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
      )}
    </button>
  );
};

interface SidebarItemNestedProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItemNested = ({ icon: Icon, label, active, onClick }: SidebarItemNestedProps) => {
  return (
    <button
      className={cn(
        "sidebar-item ml-6", 
        active && "active"
      )}
      onClick={onClick}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
};

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  language: 'en' | 'vi';
}

const Sidebar = ({ activeItem, setActiveItem, language }: SidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    administrator: false,
    recruitment: false,
    qa: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const translations = {
    en: {
      dashboard: "Dashboard",
      administrator: "Administrator",
      accounts: "Accounts",
      roles: "Roles",
      recruitment: "Recruitment",
      applies: "Applies", 
      interview: "Interview",
      ruleAssessment: "Rule Assessment",
      qa: "Q&A",
      type: "Type",
      questions: "Questions",
      history: "History",
      logout: "Log Out",
      team: "NhiLe Team"
    },
    vi: {
      dashboard: "Bảng điều khiển",
      administrator: "Quản trị viên",
      accounts: "Tài khoản",
      roles: "Vai trò",
      recruitment: "Tuyển dụng",
      applies: "Đơn ứng tuyển", 
      interview: "Phỏng vấn",
      ruleAssessment: "Đánh giá",
      qa: "Hỏi & Đáp",
      type: "Loại",
      questions: "Câu hỏi",
      history: "Lịch sử",
      logout: "Đăng xuất",
      team: "Đội ngũ NhiLe"
    }
  };

  const t = translations[language];

  return (
    <aside className="h-screen w-56 bg-sidebar-background flex flex-col border-r border-sidebar-border">
      <div className="p-4">
        <h1 className="text-xl font-semibold">{t.team}</h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        <SidebarItem
          icon={LayoutDashboard}
          label={t.dashboard}
          active={activeItem === "dashboard"}
          onClick={() => setActiveItem("dashboard")}
        />

        {/* Administrator section with nested items */}
        <div>
          <SidebarItem
            icon={User}
            label={t.administrator}
            active={activeItem === "administrator"}
            hasChildren
            expanded={expandedSections.administrator}
            onToggle={() => toggleSection("administrator")}
          />
          
          {expandedSections.administrator && (
            <div className="mt-1 space-y-1">
              <SidebarItemNested
                icon={Users}
                label={t.accounts}
                active={activeItem === "accounts"}
                onClick={() => setActiveItem("accounts")}
              />
              <SidebarItemNested
                icon={Shield}
                label={t.roles}
                active={activeItem === "roles"}
                onClick={() => setActiveItem("roles")}
              />
            </div>
          )}
        </div>

        {/* Recruitment section with nested items */}
        <div>
          <SidebarItem
            icon={Briefcase}
            label={t.recruitment}
            active={activeItem === "recruitment"}
            hasChildren
            expanded={expandedSections.recruitment}
            onToggle={() => toggleSection("recruitment")}
          />
          
          {expandedSections.recruitment && (
            <div className="mt-1 space-y-1">
              <SidebarItemNested
                icon={FileText}
                label={t.applies}
                active={activeItem === "applies"}
                onClick={() => setActiveItem("applies")}
              />
              <SidebarItemNested
                icon={MessageSquare}
                label={t.interview}
                active={activeItem === "interview"}
                onClick={() => setActiveItem("interview")}
              />
              <SidebarItemNested
                icon={FileText}
                label={t.ruleAssessment}
                active={activeItem === "rule-assessment"}
                onClick={() => setActiveItem("rule-assessment")}
              />
            </div>
          )}
        </div>

        {/* Q&A section with nested items */}
        <div>
          <SidebarItem
            icon={HelpCircle}
            label={t.qa}
            active={activeItem === "qa"}
            hasChildren
            expanded={expandedSections.qa}
            onToggle={() => toggleSection("qa")}
          />
          
          {expandedSections.qa && (
            <div className="mt-1 space-y-1">
              <SidebarItemNested
                icon={FileType}
                label={t.type}
                active={activeItem === "type"}
                onClick={() => setActiveItem("type")}
              />
              <SidebarItemNested
                icon={HelpCircle}
                label={t.questions}
                active={activeItem === "questions"}
                onClick={() => setActiveItem("questions")}
              />
              <SidebarItemNested
                icon={History}
                label={t.history}
                active={activeItem === "history"}
                onClick={() => setActiveItem("history")}
              />
            </div>
          )}
        </div>
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <SidebarItem 
          icon={LogOut} 
          label={t.logout} 
          onClick={() => console.log("Logging out...")}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
