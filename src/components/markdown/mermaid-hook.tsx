'use client'

import { useMantineColorScheme } from "@mantine/core";
import React, { useEffect, useRef } from 'react';
import { classes } from "./common";

export function MermaidHook() {
  const ref = useRef<HTMLDivElement>(null)
  const { colorScheme } = useMantineColorScheme()

  useEffect(() => {
    import('mermaid')
      .then(mod => mod.default)
      .then(mermaid => {
        const markdownHolderNode = ref.current?.parentNode
        if (!markdownHolderNode) {
          console.error('HighlightJsHook markdownHolderNode unavailable')
          return
        }

        mermaid.initialize({
          theme: colorScheme == 'dark' ? 'dark' : 'default',
          darkMode: colorScheme == 'dark',
          securityLevel: 'strict',
        })
        markdownHolderNode.querySelectorAll<HTMLElement>('.' + classes.mermaidDiagram).forEach(el => {
          el.style.display = ''
          el.style.height = '0'
          el.style.overflowY = 'hidden'
        })
        mermaid.run({
          querySelector: '.' + classes.mermaidDiagram,
          postRenderCallback: id => {
            // hide source, show diagram
            const diagramNode = document.getElementById(id)?.parentElement
            const holderNode = diagramNode?.parentNode
            if (diagramNode) {
              diagramNode.style.cssText = ''
            }
            if (holderNode) {
              Array.from(holderNode.children).forEach(child => {
                if (child instanceof HTMLElement && child.classList.contains(classes.mermaidSource)) {
                  child.style.display = 'none'
                }
              })
            }
          },
        })
          .catch(e => console.log('mermaid run failed', e))
      })
      .catch(e => console.log('mermaid load failed', e))
  })

  return <div ref={ref}></div>
}
