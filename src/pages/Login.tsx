import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear errors when user starts typing again
    if (name === 'email') {
      setEmailError(null);
    }
    if (name === 'password') {
      setPasswordError(null);
    }
  };

  const validateEmail = (email: string): boolean => {
    // Kiểm tra email có chứa nlt@gmail.com
    const emailRegex = /^[^\s@]+\.nlt@gmail\.com$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setEmailError(null);
      setPasswordError(null);

      // Validate email format
      if (!validateEmail(formData.email)) {
        setEmailError("Địa chỉ email bạn nhập không được liên kết với tài khoản nào. Hãy kiểm tra lại.");
        return;
      }

      // Validate password
      if (!formData.password) {
        setPasswordError("Vui lòng nhập mật khẩu");
        return;
      }
      
      // Login using Supabase
      const { error, success } = await login(formData.email, formData.password);
      
      if (error) {
        setPasswordError("Mật khẩu bạn đã nhập không chính xác. Hãy kiểm tra lại");
        return;
      }

      if (success) {
        // Show success message
        toast({
          title: "Đăng nhập thành công",
          description: "Đang chuyển hướng đến trang chủ...",
        });
        
        // Redirect to dashboard
        navigate("/");
      }
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
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
          <h1 className="text-2xl font-bold">Đăng nhập vào hệ thống</h1>
          <p className="text-gray-400 mt-2">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example.nlt@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
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

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`bg-transparent text-white pr-10 ${
                    passwordError ? 'border-red-500' : 'border-gray-600'
                  }`}
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-500">{passwordError}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-600 bg-transparent text-blue-600 focus:ring-blue-600"
                  disabled={isLoading}
                />
                <Label htmlFor="remember-me" className="ml-2">
                  Ghi nhớ đăng nhập
                </Label>
              </div>
              <a
                href="#"
                className="text-sm text-blue-500 hover:text-blue-400"
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login; 