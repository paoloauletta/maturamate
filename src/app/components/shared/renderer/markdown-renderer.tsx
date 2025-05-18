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
    <div
      className={`markdown-content w-full ${className}`}
      style={{
        display: "block",
        maxWidth: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch", // For smoother scrolling on iOS
      }}
    >
      <style jsx global>{`
        /* Base container styles */
        .markdown-content {
          width: 100%;
          box-sizing: border-box;
          font-size: 1rem;
          line-height: 1.6;
        }

        /* Make KaTeX math blocks responsive */
        .katex-display {
          display: block; /* Ensure it's block for layout purposes */
          box-sizing: border-box; /* Enforce border-box sizing */
          overflow-x: auto; /* Allow horizontal scrolling if content is too wide */
          overflow-y: hidden;
          max-width: 100%; /* Do not exceed parent width */
          width: 100%; /* Occupy parent's width, constrained by max-width */
          padding: 0.5em 0; /* Vertical padding */
          margin: 0.8em 0; /* Consistent vertical margin */
        }
        /* Styles for the inner .katex span within a .katex-display block */
        .katex-display > .katex {
          display: block; /* Ensure it behaves as a block within .katex-display */
          box-sizing: border-box;
          max-width: 100%; /* Respect the container's width */
          text-align: center; /* Optional: center the math content */
        }
        /* General styles for .katex (applies to inline and display math inner content) */
        .katex {
          font-size: 1.1em; /* Base font size for math */
          box-sizing: border-box; /* Enforce border-box sizing */
        }

        /* Ensure content like paragraphs and text spans full width */
        .markdown-content p,
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6,
        .markdown-content ul,
        .markdown-content ol {
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }

        /* Adjust font size on mobile for better readability */
        @media (max-width: 640px) {
          .markdown-content {
            font-size: 0.95rem;
          }
          .katex {
            /* Affects both inline and display math text size */
            font-size: 0.95em; /* Slightly smaller on mobile */
          }
          .katex-display {
            padding: 0.4em 0; /* Adjust padding on mobile */
            margin: 0.6em 0; /* Adjust margin on mobile */
          }
        }
        /* Ensure tables are responsive */
        .markdown-content table {
          display: block; /* Make table itself block to enable overflow on wrapper */
          max-width: 100%;
          overflow-x: auto; /* Scroll wide tables */
          margin-bottom: 1rem; /* Consistent spacing */
        }
        .markdown-content th,
        .markdown-content td {
          padding: 0.5rem 0.75rem; /* Adjust padding for table cells */
          border: 1px solid hsl(var(--border));
        }
        .markdown-content thead {
          background-color: hsl(var(--muted) / 0.5);
        }
        /* Ensure pre/code blocks are responsive */
        .markdown-content pre {
          overflow-x: auto; /* Scroll wide code blocks */
          padding: 0.75rem;
          margin-bottom: 1rem; /* Consistent spacing */
          border-radius: var(--radius); /* Using CSS var for consistency */
          background-color: hsl(var(--muted));
          width: 100%;
          max-width: 100%;
        }

        /* Ensure images are responsive but have a max width based on screen size */
        .markdown-content img {
          max-width: 100%;
          height: auto;
          margin: 1em auto;
          display: block;
        }

        @media (min-width: 768px) {
          .markdown-content img {
            max-width: 85%;
          }
        }

        @media (min-width: 1024px) {
          .markdown-content img {
            max-width: 80%;
          }
        }
      `}</style>
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
            return <p {...props} className="mb-2 last:mb-0 w-full" />;
          },
          h1: (props) => (
            <h1
              {...props}
              className="text-3xl font-semibold mt-8 first:mt-0 mb-4 w-full"
            />
          ),
          h2: (props) => (
            <h2
              {...props}
              className="text-2xl font-semibold mt-8 first:mt-0 mb-3 w-full"
            />
          ),
          h3: (props) => (
            <h3
              {...props}
              className="text-xl font-semibold mt-8 first:mt-0 mb-2 w-full"
            />
          ),
          ul: (props) => (
            <ul {...props} className="list-disc pl-5 mb-2 last:mb-0 w-full" />
          ),
          ol: (props) => (
            <ol
              {...props}
              className="list-decimal pl-5 mb-2 last:mb-0 w-full"
            />
          ),
          li: (props) => <li {...props} className="mb-2 last:mb-0" />,
          code: (props) => (
            <code {...props} className="bg-muted rounded px-1 py-0.5" />
          ),
          pre: (props) => (
            <pre
              {...props}
              className="bg-muted rounded p-3 mb-4 overflow-x-auto w-full"
            />
          ),
          blockquote: (props) => (
            <blockquote
              {...props}
              className="border-l-4 border-muted pl-4 italic mb-4 w-full"
            />
          ),
          img: (props) => (
            <img
              className="rounded-lg border border-muted mx-auto my-2 w-auto h-auto object-contain"
              {...props}
              loading="lazy"
              alt={props.alt ?? "image"}
              style={{ display: "block", maxWidth: "100%" }}
            />
          ),
          // Table components
          table: (props) => (
            <div className="overflow-x-auto my-6 w-full">
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
