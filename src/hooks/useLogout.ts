import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/services/auth';
import { useToast } from "@/hooks/use-toast";

export const useLogout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Tạm thời comment lại việc gọi API logout vì chưa có endpoint
      // await logout();
      
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      toast({
        title: "Đăng xuất thành công",
        description: "Bạn đã đăng xuất khỏi hệ thống",
        variant: "default"
      });
      
      // Tạm thời chuyển về trang root thay vì trang login
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      
      // Xử lý lỗi network hoặc server
      if (err instanceof Error && 
        (err.message.includes('Network Error') || err.message.includes('Failed to fetch'))) {
        // Nếu lỗi mạng hoặc server, vẫn cho phép đăng xuất
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/', { replace: true });
        
        toast({
          title: "Đăng xuất thành công",
          description: "Đã xóa phiên đăng nhập của bạn",
          variant: "default"
        });
      } else {
        // Các lỗi khác
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Đăng xuất thất bại. Vui lòng thử lại.';
        
        setError(errorMessage);
        toast({
          title: "Lỗi",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogout, isLoading, error };
}; 