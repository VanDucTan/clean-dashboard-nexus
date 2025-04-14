import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPassword = () => {
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+\.nlt@gmail\.com$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setEmailError(null);

      // Validate email format
      if (!validateEmail(email)) {
        setEmailError("Địa chỉ email bạn nhập không được liên kết với tài khoản nào. Hãy kiểm tra lại.");
        return;
      }

      // Request password reset
      const { error } = await resetPassword(email);
      
      if (error) {
        setEmailError("Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại sau.");
        return;
      }

      // Show success message
      setIsEmailSent(true);
      toast({
        title: "Đã gửi email khôi phục mật khẩu",
        description: "Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.",
      });
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Không thể gửi email",
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1f37] text-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quên mật khẩu</h1>
          <p className="text-gray-400 mt-2">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>

        {isEmailSent ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-500/10 text-green-500 rounded-lg">
              Email khôi phục mật khẩu đã được gửi!
            </div>
            <p className="text-gray-400">
              Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.
            </p>
            <Button
              asChild
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Link to="/login">Quay lại đăng nhập</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example.nlt@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(null);
                }}
                className={`bg-transparent border-gray-600 text-white ${
                  emailError ? 'border-red-500' : ''
                }`}
                disabled={isLoading}
                required
              />
              {emailError && (
                <div className="flex items-start gap-2 text-red-500 text-sm mt-1">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi liên kết khôi phục"}
              </Button>

              <Button
                asChild
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                <Link to="/login">Quay lại đăng nhập</Link>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 