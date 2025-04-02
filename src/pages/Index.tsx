
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import Placeholder from "@/components/Placeholder";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'vi'>('en');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle theme toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Handle language toggle
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Get the translated title for placeholders
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

  // Render the active content based on sidebar selection
  const renderContent = () => {
    switch (activeItem) {
      case "dashboard":
        return <Dashboard language={language} />;
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
