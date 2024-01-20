import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@/styles/github-markdown.css"

export default function GfmMarkdown({children, ...markdownProps}: {children: string, [_: string]: any}) {
  return (
    <div className="markdown-body">
      <Markdown {...markdownProps} remarkPlugins={[remarkGfm]}>
        {children}
      </Markdown>
    </div>
  )
}
