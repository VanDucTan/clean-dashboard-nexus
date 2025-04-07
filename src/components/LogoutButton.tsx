import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LogoutButtonProps {
  language?: 'en' | 'vi';
}

const LogoutButton = ({ language = 'vi' }: LogoutButtonProps) => {
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
    <div 
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
      role="button"
      tabIndex={0}
    >
      <LogOut size={20} />
      <span>{language === 'en' ? 'Log Out' : 'Đăng xuất'}</span>
    </div>
  );
};

export default LogoutButton; 