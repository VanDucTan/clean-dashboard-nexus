
import React from "react";
import { Users } from "lucide-react";

interface DashboardProps {
  language: 'en' | 'vi';
}

const Dashboard = ({ language }: DashboardProps) => {
  const translations = {
    en: {
      dashboard: "Dashboard",
      totalMembers: "Total members",
    },
    vi: {
      dashboard: "Bảng điều khiển",
      totalMembers: "Tổng số thành viên",
    }
  };

  const t = translations[language];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t.dashboard}</h1>
      
      <div className="card p-6 w-64">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{t.totalMembers}</p>
            <h2 className="text-3xl font-bold mt-1">0</h2>
          </div>
          <div className="bg-primary/10 p-2 rounded-full">
            <Users size={20} className="text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
