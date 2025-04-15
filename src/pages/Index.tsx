import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import Accounts from "@/components/Accounts";
import Placeholder from "@/components/Placeholder";
import RolesManagement from "@/components/RolesManagement";
import TeamsManagement from "@/components/TeamsManagement";
import AppliesManagement from "@/components/AppliesManagement";
import InterviewManagement from "@/components/InterviewManagement";
import RuleAssessmentManagement from "@/components/RuleAssessmentManagement";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'vi'>('en');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getTranslatedTitle = (id: string) => {
    const translations: Record<string, { en: string, vi: string }> = {
      "administrator": { en: "Administrator", vi: "Quản trị viên" },
      "accounts": { en: "Accounts", vi: "Tài khoản" },
      "roles": { en: "Roles", vi: "Vai trò" },
      "recruitment": { en: "Recruitment", vi: "Tuyển dụng" },
      "applies": { en: "Applies", vi: "Đơn ứng tuyển" },
      "interview": { en: "Interview", vi: "Phỏng vấn" },
      "rule-assessment": { en: "Rule Assessment", vi: "Đánh giá" },
      "qa": { en: "Q&A", vi: "Hỏi & Đáp" },
      "type": { en: "Type", vi: "Loại" },
      "questions": { en: "Questions", vi: "Câu hỏi" },
      "history": { en: "History", vi: "Lịch sử" },
    };
    
    return translations[id] 
      ? translations[id][language] 
      : id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
  };

    const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return <Dashboard language={language} />;
      case "accounts":
        return <Accounts language={language} />;
      case "roles":
        return <RolesManagement 
          language={language} 
          text={{
            title: language === 'en' ? 'Roles Management' : 'Quản lý vai trò',
            loading: language === 'en' ? 'Loading...' : 'Đang tải...',
            noRoles: language === 'en' ? 'No roles found' : 'Không tìm thấy vai trò nào',
            showing: language === 'en' ? 'Showing' : 'Hiển thị',
            perPage: language === 'en' ? 'per page' : 'mỗi trang',
            editRole: language === 'en' ? 'Edit Role' : 'Sửa vai trò',
            create: language === 'en' ? 'Create Role' : 'Tạo vai trò',
            searchPlaceholder: language === 'en' ? 'Search roles...' : 'Tìm kiếm vai trò...',
            deleteRole: language === 'en' ? 'Delete Role' : 'Xóa vai trò',
            deleteConfirmation: language === 'en' ? 'Are you sure you want to delete this role?' : 'Bạn có chắc chắn muốn xóa vai trò này?',
            delete: language === 'en' ? 'Delete' : 'Xóa',
            name: language === 'en' ? 'Name' : 'Tên',
            description: language === 'en' ? 'Description' : 'Mô tả',
            createdAt: language === 'en' ? 'Created At' : 'Ngày tạo',
            actions: language === 'en' ? 'Actions' : 'Thao tác',
            of: language === 'en' ? 'of' : 'của'
          }}
        />;
      case "teams":
        return <TeamsManagement language={language} />;
      case "applies":
        return <AppliesManagement language={language} />;
      case "interview":
        return <InterviewManagement language={language} />;
      case "rule-assessment":
        return <RuleAssessmentManagement language={language} />;
      default:
        return <Placeholder 
          title={getTranslatedTitle(activeItem)} 
          language={language} 
        />;
    }
  };


  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        activeItem={activeItem} 
        setActiveItem={setActiveItem} 
        language={language}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
      />
      
      <div className={cn("flex-1 flex flex-col overflow-hidden smooth-transition", 
        isCollapsed ? "pl-0" : "")}>
        <Header 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
          language={language} 
          toggleLanguage={toggleLanguage} 
        />
        <main className="flex-1 overflow-y-auto smooth-transition">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
