import { clsx } from "clsx";
import { Element, Root } from "hast";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import "@/styles/github-markdown.css"
import { visit } from "unist-util-visit";

// fix for https://github.com/tailwindlabs/tailwindcss/pull/7742#issuecomment-1061332148
function imageFixer(): (tree: Root) => Root {
  return (tree: Root): Root => {
    visit(tree, 'element', (node: Element) => {
      if ('tagName' in node && node.tagName === 'img') {
        const height = node.properties['height']
        if (height !== undefined) {
          let prevStyle = node.properties.style
          if (typeof prevStyle !== 'string') {
            prevStyle = ''
          }
          if (prevStyle && !/;\s*/.test(prevStyle)) {
            prevStyle += '; '
          }
          node.properties.style = `${prevStyle}height: ${height}px;`
        }
      }
    })
    return tree
  }
}

interface GfmMarkdownProps {
  children: string,
  allowEmbedHtml?: boolean
  [_: string]: any
}

export default function GfmMarkdown({children, allowEmbedHtml, ...markdownProps}: GfmMarkdownProps) {
  return (
    <div className={clsx("markdown-body")}>
      <Markdown
        {...markdownProps}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={allowEmbedHtml ? [rehypeRaw, rehypeSanitize, imageFixer] : undefined}
      >
        {children}
      </Markdown>
    </div>
  )
}
