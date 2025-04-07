import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: 'en' | 'vi';
}

const LogoutDialog = ({ open, onOpenChange, language }: LogoutDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      
      toast({
        title: language === 'en' ? "Logged out successfully" : "Đăng xuất thành công",
        description: language === 'en' ? "Redirecting to login..." : "Đang chuyển hướng đến trang đăng nhập...",
      });
      
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: language === 'en' ? "Error" : "Lỗi",
        description: language === 'en' ? "Failed to logout. Please try again." : "Đăng xuất thất bại. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {language === 'en' ? "Are you sure you want to logout?" : "Bạn có chắc chắn muốn đăng xuất?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {language === 'en' ? "You will be redirected to the login page." : "Bạn sẽ được chuyển hướng đến trang đăng nhập."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {language === 'en' ? "Cancel" : "Hủy"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading 
              ? (language === 'en' ? "Logging out..." : "Đang đăng xuất...") 
              : (language === 'en' ? "Logout" : "Đăng xuất")
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutDialog; 