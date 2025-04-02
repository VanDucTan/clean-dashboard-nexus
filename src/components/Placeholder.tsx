
import React from "react";

interface PlaceholderProps {
  title: string;
}

const Placeholder = ({ title }: PlaceholderProps) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">{title}</h1>
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">
          {title} content goes here
        </p>
      </div>
    </div>
  );
};

export default Placeholder;
