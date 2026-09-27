import { ElementContent, Root } from "hast";
import "@/styles/github-markdown.css"
import { visit } from "unist-util-visit";
import { classes } from "./common";

// fix for https://github.com/tailwindlabs/tailwindcss/pull/7742#issuecomment-1061332148
export function imageHeightFixer(): (tree: Root) => Root {
  return (tree: Root): Root => {
    visit(tree, 'element', (node) => {
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

// transform
//     <parent>
//       <pre><code className="language-mermaid">xxxx</code></pre>
//     </parent>
// into
//     <parent>
//       <div className="mermaid-holder">
//         <div className="mermaid-diagram">xxxx</div>
//         <pre className="mermaid-source"><code className="language-mermaid">xxxx</code></pre>
//       </div>
//     </parent>
export function mermaidTransformer(): (tree: Root) => Root {
  return (tree: Root): Root => {
    visit(tree, 'element', (node, index, parent) => {
      // parent: tag == <whatever>
      // node: tag == 'pre'
      // child: tag == 'code'
      if (!(parent && node.tagName === 'pre')) {
        return
      }

      const child = node.children[0]
      if (!(child && child.type === 'element' && child.tagName === 'code')) {
        return
      }
      if (!(Array.isArray(child.properties.className) && child.properties.className.includes('language-mermaid'))) {
        return
      }

      const textNode = child.children[0]
      if (!(textNode !== undefined && textNode.type === 'text')) {
        return
      }

      const idx = parent.children.indexOf(node)
      if (idx === -1) {
        return
      }

      const diagramNode: ElementContent =  {
        type: 'element',
        tagName: 'div',
        properties: {
          className: [classes.mermaidDiagram],
          style: 'display: none',
        },
        children: [{
          'type': 'text',
          'value': textNode.value,
        }],
      }

      node.properties.className = [classes.mermaidSource]
      parent.children[idx] = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: [classes.mermaidHolder],
        },
        children: [
          diagramNode,
          node,
        ],
      }
    })
    return tree
  }
}

const ABSOLUTE_URL_REGEX = /^[a-z][a-z0-9+.-]*:/i

function isRelativeUrl(url: unknown): url is string {
  return typeof url === 'string'
    && url.length > 0
    && !url.startsWith('#')
    && !url.startsWith('/')
    && !ABSOLUTE_URL_REGEX.test(url)
}

// without this, remark-github leaves them relative and they resolve against this website
function withTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : url + '/'
}

export function relativeUrlRewriter(options: { linkBase: string, imageBase: string }): (tree: Root) => Root {
  const linkBase = withTrailingSlash(options.linkBase)
  const imageBase = withTrailingSlash(options.imageBase)
  return (tree: Root): Root => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'a' && isRelativeUrl(node.properties.href)) {
        node.properties.href = linkBase + node.properties.href
      } else if (node.tagName === 'img' && isRelativeUrl(node.properties.src)) {
        node.properties.src = imageBase + node.properties.src
      }
    })
    return tree
  }
}
