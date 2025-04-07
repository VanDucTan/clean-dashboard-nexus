import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  Globe,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: 'en' | 'vi';
  toggleLanguage: () => void;
}

const Header = ({ isDarkMode, toggleTheme, language, toggleLanguage }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Logout using AuthContext
    logout();
    
    // Show success message
    toast({
      title: language === 'en' ? "Logged out successfully" : "Đã đăng xuất",
      description: language === 'en' ? "Redirecting to login..." : "Đang chuyển hướng đến trang đăng nhập...",
    });
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <header className="flex justify-end items-center p-4 border-b">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleLanguage}
          className="rounded-full h-8 w-8"
          aria-label="Toggle language"
        >
          <Globe size={16} />
          <span className="ml-1 text-xs font-medium">{language === 'en' ? 'EN' : 'VI'}</span>
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full h-8 w-8"
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleLogout}
          className="rounded-full h-8 w-8 text-red-500 hover:text-red-600 hover:border-red-600"
          aria-label={language === 'en' ? "Logout" : "Đăng xuất"}
        >
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
