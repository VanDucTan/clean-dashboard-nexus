import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Moon, 
  Sun, 
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: 'en' | 'vi';
  toggleLanguage: () => void;
}

const Header = ({ isDarkMode, toggleTheme, language, toggleLanguage }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return (
    <header className="flex justify-end items-center p-4 border-b">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleLanguage}
          className="rounded-full h-8 w-8"
        >
          <Globe size={16} />
          <span className="ml-1 text-xs font-medium">{language === 'en' ? 'EN' : 'VI'}</span>
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleTheme}
          className="rounded-full h-8 w-8"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>
    </header>
  );
};

export default Header;
