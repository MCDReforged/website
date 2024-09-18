import { clsx } from "clsx";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { PluggableList } from "unified";
import { AnchorIdSanitizeFixer } from "./anchor-id-sanitize-fixer";
import { alerts } from "./gfm-markdown-alerts";
import { HighlightJsHookDynamic } from "./highlight-js-hook-dynamic";
import { MermaidHook } from "./mermaid-hook";
import { rehypeGithubAlerts } from "./rehype-plugin-github-alerts";
import { imageHeightFixer, mermaidTransformer } from "./rehype-plugins";
import "@/styles/github-markdown.css"
import "@/styles/github-markdown-alert.css"

interface GfmMarkdownProps {
  children: string,
  className?: string,
  allowEmbedHtml?: boolean
  allowAnchor?: boolean
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

export default function GfmMarkdown({children, className, allowEmbedHtml, allowAnchor, ...markdownProps}: GfmMarkdownProps) {
  const flags = CheckMarkdownFeatures(children)

  const remarkPlugins: PluggableList = [
    remarkGfm,
  ]
  const rehypePlugins: PluggableList = []
  if (allowEmbedHtml) {
    rehypePlugins.push(rehypeRaw)
  }
  if (allowAnchor) {
    rehypePlugins.push(rehypeSlug)
  }
  if (rehypePlugins.length > 0) {
    rehypePlugins.push(rehypeSanitize)
  }
  if (allowEmbedHtml) {
    rehypePlugins.push(imageHeightFixer)
  }
  rehypePlugins.push([rehypeGithubAlerts, {alerts: alerts}])
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
      {allowAnchor && <AnchorIdSanitizeFixer/>}
    </div>
  )
}
