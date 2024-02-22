import { clsx } from "clsx";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { PluggableList } from "unified";
import { HighlightJsHookDynamic } from "./highlight-js-hook-dynamic";
import { MermaidHook } from "./mermaid-hook";
import { imageHeightFixer, mermaidTransformer } from "./rehype-plugins";
import "@/styles/github-markdown.css"

interface GfmMarkdownProps {
  children: string,
  className?: string,
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

export default function GfmMarkdown({children, className, allowEmbedHtml, ...markdownProps}: GfmMarkdownProps) {
  const flags = CheckMarkdownFeatures(children)

  const remarkPlugins: PluggableList = [remarkGfm]
  const rehypePlugins: PluggableList = []
  if (allowEmbedHtml) {
    rehypePlugins.push(...[
      rehypeRaw,
      rehypeSanitize,
      imageHeightFixer,
    ])
  }
  rehypePlugins.push(mermaidTransformer)

  return (
    <div className={clsx("markdown-body", className)}>
      <Markdown
        {...markdownProps}
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
      >
        {children}
      </Markdown>
      {flags.hasCodeBlock && <HighlightJsHookDynamic ignoredLanguages={['mermaid']}/>}
      {flags.hasMermaid && <MermaidHook/>}
    </div>
  )
}
