import { clsx } from "clsx";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { HighlightJsHookDynamic } from "./highlight-js-hook-dynamic";
import { MermaidHook } from "./mermaid-hook";
import { imageHeightFixer, mermaidTransformer } from "./rehype-plugins";
import "@/styles/github-markdown.css"

interface GfmMarkdownProps {
  children: string,
  allowEmbedHtml?: boolean
  [_: string]: any
}

interface FeatureFlags {
  hasCodeBlock: boolean
  hasMermaid: boolean
}

function CheckMarkdownFeatures(text: string): FeatureFlags {
  const hasCodeBlock = text.includes('\n') && !!text.match(/^[ \t]*(```+|~~~+)/m)
  return {
    hasCodeBlock: hasCodeBlock,
    hasMermaid: hasCodeBlock && !!text.match(/^[ \t]*(```+|~~~+) *mermaid/m),
  }
}

export default function GfmMarkdown({children, allowEmbedHtml, ...markdownProps}: GfmMarkdownProps) {
  const flags = CheckMarkdownFeatures(children)
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
      {flags.hasCodeBlock && <HighlightJsHookDynamic ignoredLanguages={['mermaid']}/>}
      {flags.hasMermaid && <MermaidHook/>}
    </div>
  )
}
