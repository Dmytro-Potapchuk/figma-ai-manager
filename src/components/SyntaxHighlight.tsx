import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/themes/prism-tomorrow.css";

interface Props {
  code: string;
  language: "css" | "json" | "plain";
}

export function SyntaxHighlight({ code, language }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (ref.current && language !== "plain") {
      Prism.highlightElement(ref.current);
    }
  }, [code, language]);

  if (language === "plain") {
    return (
      <pre className="text-xs whitespace-pre-wrap break-words font-mono text-foreground">
        {code}
      </pre>
    );
  }

  return (
    <pre className="text-xs whitespace-pre-wrap break-words !bg-transparent !m-0 !p-0">
      <code ref={ref} className={`language-${language}`}>
        {code}
      </code>
    </pre>
  );
}
