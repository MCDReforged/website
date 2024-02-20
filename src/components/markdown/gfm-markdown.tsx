import { MermaidHook } from "@/components/markdown/mermaid-hook";
import { imageHeightFixer, mermaidTransformer } from "@/components/markdown/rehype-plugins";
import { clsx } from "clsx";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import "@/styles/github-markdown.css"

interface GfmMarkdownProps {
  children: string,
  allowEmbedHtml?: boolean
  [_: string]: any
}

export default function GfmMarkdown({children, allowEmbedHtml, ...markdownProps}: GfmMarkdownProps) {
  const hasMermaid = !!children.match(/``` *mermaid/)
  return (
    <div className={clsx("markdown-body")} suppressHydrationWarning>
      <Markdown
        {...markdownProps}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={allowEmbedHtml ? [
          rehypeRaw,
          rehypeSanitize,
          imageHeightFixer,
          mermaidTransformer,
        ] : undefined}
      >
        {children}
      </Markdown>
      {hasMermaid && <MermaidHook/>}
    </div>
  )
}
