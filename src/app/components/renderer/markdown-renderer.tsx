"use client";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string | string[];
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  // Process the content based on its type
  const processContent = () => {
    // If content is an array, join it with newlines
    if (Array.isArray(content)) {
      return content.join("\n\n");
    }

    // If content is a string but looks like a stringified array, parse and join it
    if (
      typeof content === "string" &&
      content.trim().startsWith("[") &&
      content.trim().endsWith("]")
    ) {
      try {
        const parsedContent = JSON.parse(content);
        if (Array.isArray(parsedContent)) {
          return parsedContent.join("\n\n");
        }
      } catch {
        // If parsing fails, just use the string as is
      }
    }

    // Otherwise, return the content as is
    return content as string;
  };

  const formattedContent = processContent();

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
        components={{
          // When using markdown, the p tag is the default container for text
          p: ({ node, ...props }) => {
            // Check if paragraph contains only an image
            const hasOnlyImage =
              node?.children?.length === 1 &&
              node.children[0].type === "element" &&
              node.children[0].tagName === "img";

            // If it contains only an image, render a div instead of a p to avoid nesting issues
            if (hasOnlyImage) {
              return <div {...props} className="my-8" />;
            }

            // Otherwise render a normal paragraph
            return <p {...props} className="mb-2 last:mb-0" />;
          },
          h1: (props) => (
            <h1
              {...props}
              className="text-2xl font-semibold mt-8 first:mt-0 mb-4"
            />
          ),
          h2: (props) => (
            <h2
              {...props}
              className="text-xl font-semibold mt-8 first:mt-0 mb-3"
            />
          ),
          h3: (props) => (
            <h3
              {...props}
              className="text-lg font-semibold mt-8 first:mt-0 mb-2"
            />
          ),
          ul: (props) => (
            <ul {...props} className="list-disc pl-5 mb-2 last:mb-0" />
          ),
          ol: (props) => (
            <ol {...props} className="list-decimal pl-5 mb-2 last:mb-0" />
          ),
          li: (props) => <li {...props} className="mb-2 last:mb-0" />,
          code: (props) => (
            <code {...props} className="bg-muted rounded px-1 py-0.5" />
          ),
          pre: (props) => (
            <pre
              {...props}
              className="bg-muted rounded p-3 mb-4 overflow-x-auto"
            />
          ),
          blockquote: (props) => (
            <blockquote
              {...props}
              className="border-l-4 border-muted pl-4 italic mb-4"
            />
          ),
          img: (props) => (
            <img
              className="rounded-lg border border-muted mx-auto my-2"
              {...props}
              loading="lazy"
              alt={props.alt ?? "image"}
              style={{ display: "block" }}
            />
          ),
          // Table components
          table: (props) => (
            <div className="overflow-x-auto my-6">
              <table
                {...props}
                className="w-full border-collapse border border-border rounded-md"
              />
            </div>
          ),
          thead: (props) => <thead {...props} className="bg-muted/50" />,
          tbody: (props) => <tbody {...props} />,
          tr: (props) => (
            <tr {...props} className="border-b border-border last:border-0" />
          ),
          th: (props) => (
            <th
              {...props}
              className="px-4 py-2 text-left font-semibold text-foreground"
            />
          ),
          td: (props) => (
            <td {...props} className="px-4 py-2 text-foreground" />
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
}
