
import React from "react";
import { Users } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      
      <div className="card p-6 w-64">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">Total members</p>
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
