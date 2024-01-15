import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "@/styles/github-markdown.css"

export default function GfmMarkdown({children, ...props}: {children: string, [key: string]: any}) {
  return (
    <div className="markdown-body">
      <Markdown {...props} remarkPlugins={[remarkGfm]}>
        {children}
      </Markdown>
    </div>
  )
}
