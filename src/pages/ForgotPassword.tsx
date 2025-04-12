import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    code: "",
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+\.nlt@gmail\.com$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (name === "email") setEmailError(null);
    if (name === "code") setCodeError(null);
  };

  const handleSendCode = async () => {
    try {
      setIsLoading(true);
      setEmailError(null);

      if (!validateEmail(formData.email)) {
        setEmailError(
          "Địa chỉ email bạn nhập không được liên kết với tài khoản nào. Hãy kiểm tra lại."
        );
        return;
      }

      // Check if email exists in auth.users
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("email", formData.email)
        .single();

      if (userError || !user) {
        setEmailError(
          "Địa chỉ email bạn nhập không được liên kết với tài khoản nào. Hãy kiểm tra lại."
        );
        return;
      }

      // Generate a random 6-digit code
      const verificationCode = Math.floor(100000 + Math.random() * 900000);

      // Store the code in reset_codes table
      const { error: insertError } = await supabase
        .from("reset_codes")
        .insert([
          {
            email: formData.email,
            code: verificationCode,
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes expiry
          },
        ])
        .single();

      if (insertError) throw insertError;

      // In a real app, you would send this code via email
      // For demo purposes, we'll show it in a toast
      toast({
        title: "Mã xác thực đã được gửi",
        description: `Mã xác thực của bạn là: ${verificationCode}`,
      });

      setCodeSent(true);
      setCountdown(60); // Start 60-second countdown
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể gửi mã xác thực. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetPassword = async () => {
    try {
      setIsLoading(true);
      setCodeError(null);

      if (!formData.code) {
        setCodeError("Vui lòng nhập mã xác thực");
        return;
      }

      if (isNaN(Number(formData.code))) {
        setCodeError("Mã xác thực phải là số");
        return;
      }

      // Verify the code
      const { data: resetCode, error: codeError } = await supabase
        .from("reset_codes")
        .select("*")
        .eq("email", formData.email)
        .eq("code", formData.code)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (codeError || !resetCode) {
        setCodeError("Mã xác thực không chính xác hoặc đã hết hạn");
        return;
      }

      // Get user's password
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("password")
        .eq("email", formData.email)
        .single();

      if (userError || !user) {
        throw new Error("Không thể lấy thông tin mật khẩu");
      }

      // Show password in toast
      toast({
        title: "Thông tin mật khẩu",
        description: `Mật khẩu của bạn là: ${user.password}`,
      });

      // Delete used code
      await supabase
        .from("reset_codes")
        .delete()
        .eq("email", formData.email);

      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate("/login");
      }, 5000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
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
            Nhập email của bạn để lấy lại mật khẩu
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name.nlt@gmail.com"
                value={formData.email}
                onChange={handleInputChange}
                className={`bg-transparent border-gray-600 text-white ${
                  emailError ? "border-red-500" : ""
                }`}
                disabled={isLoading || codeSent}
                required
              />
              {emailError && (
                <div className="flex items-start gap-2 text-red-500 text-sm mt-1">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <Button
              type="button"
              onClick={handleSendCode}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={
                isLoading ||
                !formData.email ||
                countdown > 0 ||
                !validateEmail(formData.email)
              }
            >
              {countdown > 0
                ? `Gửi lại mã sau ${countdown}s`
                : isLoading
                ? "Đang gửi..."
                : "Gửi mã xác thực"}
            </Button>

            {codeSent && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code">Mã xác thực</Label>
                  <Input
                    id="code"
                    name="code"
                    type="number"
                    placeholder="Nhập mã 6 số"
                    value={formData.code}
                    onChange={handleInputChange}
                    className={`bg-transparent border-gray-600 text-white ${
                      codeError ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                    required
                  />
                  {codeError && (
                    <div className="flex items-start gap-2 text-red-500 text-sm mt-1">
                      <AlertTriangle className="h-4 w-4 mt-0.5" />
                      <span>{codeError}</span>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleGetPassword}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading || !formData.code}
                >
                  {isLoading ? "Đang xử lý..." : "Lấy thông tin mật khẩu"}
                </Button>
              </>
            )}

            <Button
              type="button"
              onClick={() => navigate("/login")}
              variant="outline"
              className="w-full"
            >
              Quay lại đăng nhập
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 