
import React from "react";

interface PlaceholderProps {
  title: string;
  language: 'en' | 'vi';
}

const Placeholder = ({ title, language }: PlaceholderProps) => {
  const contentText = language === 'en' 
    ? `${title} content goes here`
    : `Nội dung của ${title} sẽ hiển thị ở đây`;
    
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{title}</h1>
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          {contentText}
        </p>
      </div>
    </div>
  );
};

export default Placeholder;
