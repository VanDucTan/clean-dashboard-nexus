import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
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
  ChevronRight,
  ChevronLeft,
  ChevronLeftSquare,
  PanelLeft,
  UserCircle,
  Users2,
  FileSpreadsheet,
  CalendarClock,
  Scale,
  Settings,
  UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import LogoutDialog from "./LogoutDialog";

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
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ activeItem, setActiveItem, language, isCollapsed, toggleSidebar }: SidebarProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    administrator: false,
    recruitment: false,
    qa: false
  });
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    logout();
    toast({
      title: language === 'en' ? "Logged out successfully" : "Đã đăng xuất",
      description: language === 'en' ? "Redirecting to login..." : "Đang chuyển hướng đến trang đăng nhập...",
    });
    navigate("/login");
  };

  const translations = {
    en: {
      dashboard: "Dashboard",
      administrator: "Administrator",
      accounts: "Accounts",
      roles: "Roles",
      teams: "Teams",
      recruitment: "Recruitment",
      applies: "Applies", 
      interview: "Interview",
      ruleAssessment: "Rule Assessment",
      qa: "Q&A",
      type: "Type",
      questions: "Questions",
      history: "History",
      logout: "Log Out",
      memberInfo: "Member Information",
    },
    vi: {
      dashboard: "Bảng điều khiển",
      administrator: "Quản trị viên",
      accounts: "Tài khoản",
      roles: "Vai trò",
      teams: "Nhóm",
      recruitment: "Tuyển dụng",
      applies: "Đơn ứng tuyển", 
      interview: "Phỏng vấn",
      ruleAssessment: "Đánh giá",
      qa: "Hỏi & Đáp",
      type: "Loại",
      questions: "Câu hỏi",
      history: "Lịch sử",
      logout: "Đăng xuất",
      memberInfo: "Thông tin thành viên",
    }
  };

  const t = translations[language];

  const items = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      titleEn: "Dashboard",
      titleVi: "Trang chủ"
    },
    {
      id: "member-info",
      icon: UserCog,
      titleEn: "Member Information",
      titleVi: "Thông tin thành viên"
    },
    {
      id: "administrator",
      icon: User,
      titleEn: "Administrator",
      titleVi: "Quản trị viên",
      children: [
        {
          id: "accounts",
          icon: Users,
          titleEn: "Accounts",
          titleVi: "Tài khoản"
        },
        {
          id: "roles",
          icon: Shield,
          titleEn: "Roles",
          titleVi: "Vai trò"
        }
      ]
    },
    {
      id: "teams",
      icon: Users2,
      titleEn: "Teams",
      titleVi: "Nhóm"
    },
    {
      id: "recruitment",
      icon: Briefcase,
      titleEn: "Recruitment",
      titleVi: "Tuyển dụng",
      children: [
        {
          id: "applies",
          icon: FileSpreadsheet,
          titleEn: "Applies",
          titleVi: "Đơn ứng tuyển"
        },
        {
          id: "interview",
          icon: CalendarClock,
          titleEn: "Interview",
          titleVi: "Phỏng vấn"
        },
        {
          id: "rule-assessment",
          icon: Scale,
          titleEn: "Rule Assessment",
          titleVi: "Đánh giá quy tắc"
        }
      ]
    },
    {
      id: "qa",
      icon: HelpCircle,
      titleEn: "Q&A",
      titleVi: "Hỏi & Đáp",
      children: [
        {
          id: "type",
          icon: FileType,
          titleEn: "Type",
          titleVi: "Loại"
        },
        {
          id: "questions",
          icon: HelpCircle,
          titleEn: "Questions",
          titleVi: "Câu hỏi"
        },
        {
          id: "history",
          icon: History,
          titleEn: "History",
          titleVi: "Lịch sử"
        }
      ]
    }
  ];

  return (
    <>
      <aside className={cn(
        "h-screen bg-sidebar-background flex flex-col border-r border-sidebar-border smooth-transition overflow-hidden",
        isCollapsed ? "w-16" : "w-56"
      )}>
        <div className="p-4 flex justify-between items-center">
          {!isCollapsed && (
            <h1 className={cn("text-xl font-semibold overflow-hidden whitespace-nowrap smooth-transition", 
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto")}>
              NhiLe Team
            </h1>
          )}
          <button 
            onClick={toggleSidebar} 
            className="p-1 rounded-lg hover:bg-sidebar-accent smooth-transition"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft size={18} className={cn("smooth-transition", isCollapsed ? "rotate-180" : "")} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <SidebarItem
            icon={LayoutDashboard}
            label={isCollapsed ? "" : t.dashboard}
            active={activeItem === "dashboard"}
            onClick={() => setActiveItem("dashboard")}
          />

          <SidebarItem
            icon={UserCog}
            label={isCollapsed ? "" : (language === 'en' ? "Member Information" : "Thông tin thành viên")}
            active={activeItem === "member-info"}
            onClick={() => setActiveItem("member-info")}
          />

          <div>
            <SidebarItem
              icon={User}
              label={isCollapsed ? "" : t.administrator}
              active={activeItem === "administrator"}
              hasChildren={!isCollapsed}
              expanded={expandedSections.administrator}
              onToggle={() => !isCollapsed && toggleSection("administrator")}
            />
            
            {!isCollapsed && expandedSections.administrator && (
              <div className="mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out">
                <SidebarItemNested
                  icon={Users}
                  label={language === 'en' ? "Accounts" : "Tài khoản"}
                  active={activeItem === "accounts"}
                  onClick={() => setActiveItem("accounts")}
                />
                <SidebarItemNested
                  icon={Shield}
                  label={language === 'en' ? "Roles" : "Vai trò"}
                  active={activeItem === "roles"}
                  onClick={() => setActiveItem("roles")}
                />
              </div>
            )}
          </div>

          <SidebarItem
            icon={Users2}
            label={isCollapsed ? "" : t.teams}
            active={activeItem === "teams"}
            onClick={() => setActiveItem("teams")}
          />

          <div>
            <SidebarItem
              icon={Briefcase}
              label={isCollapsed ? "" : t.recruitment}
              active={activeItem === "recruitment"}
              hasChildren={!isCollapsed}
              expanded={expandedSections.recruitment}
              onToggle={() => !isCollapsed && toggleSection("recruitment")}
            />
            
            {!isCollapsed && expandedSections.recruitment && (
              <div className="mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out">
                <SidebarItemNested
                  icon={FileSpreadsheet}
                  label={language === 'en' ? "Applies" : "Đơn ứng tuyển"}
                  active={activeItem === "applies"}
                  onClick={() => setActiveItem("applies")}
                />
                <SidebarItemNested
                  icon={CalendarClock}
                  label={language === 'en' ? "Interview" : "Phỏng vấn"}
                  active={activeItem === "interview"}
                  onClick={() => setActiveItem("interview")}
                />
                <SidebarItemNested
                  icon={Scale}
                  label={language === 'en' ? "Rule Assessment" : "Đánh giá quy tắc"}
                  active={activeItem === "rule-assessment"}
                  onClick={() => setActiveItem("rule-assessment")}
                />
              </div>
            )}
          </div>

          <div>
            <SidebarItem
              icon={HelpCircle}
              label={isCollapsed ? "" : t.qa}
              active={activeItem === "qa"}
              hasChildren={!isCollapsed}
              expanded={expandedSections.qa}
              onToggle={() => !isCollapsed && toggleSection("qa")}
            />
            
            {!isCollapsed && expandedSections.qa && (
              <div className="mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out">
                <SidebarItemNested
                  icon={FileType}
                  label={language === 'en' ? "Type" : "Loại"}
                  active={activeItem === "type"}
                  onClick={() => setActiveItem("type")}
                />
                <SidebarItemNested
                  icon={HelpCircle}
                  label={language === 'en' ? "Questions" : "Câu hỏi"}
                  active={activeItem === "questions"}
                  onClick={() => setActiveItem("questions")}
                />
                <SidebarItemNested
                  icon={History}
                  label={language === 'en' ? "History" : "Lịch sử"}
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
            label={isCollapsed ? "" : t.logout}
            onClick={() => setIsLogoutDialogOpen(true)}
          />
        </div>
      </aside>
      
      <LogoutDialog 
        open={isLogoutDialogOpen} 
        onOpenChange={setIsLogoutDialogOpen}
        language={language}
      />
    </>
  );
};

export default Sidebar;
