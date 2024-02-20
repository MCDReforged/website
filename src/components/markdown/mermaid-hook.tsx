'use client'

import { useMantineColorScheme } from "@mantine/core";
import React, { useEffect } from 'react';

export function MermaidHook() {
  const { colorScheme } = useMantineColorScheme()

  useEffect(() => {
    import('mermaid')
      .then(mod => mod.default)
      .then(mermaid => {
        mermaid.initialize({
          theme: colorScheme == 'dark' ? 'dark' : 'default',
          darkMode: colorScheme == 'dark',
          securityLevel: 'strict',
        })
        document.querySelectorAll<HTMLElement>('.mermaid-diagram').forEach(el => {
          el.style.display = ''
          el.style.height = '0'
          el.style.overflowY = 'hidden'
        })
        mermaid.run({
          querySelector: '.mermaid-diagram',
          postRenderCallback: id => {
            // hide source, show diagram
            const diagramNode = document.getElementById(id)?.parentElement
            const holderNode = diagramNode?.parentNode
            if (diagramNode) {
              diagramNode.style.cssText = ''
            }
            if (holderNode) {
              Array.from(holderNode.children).forEach(child => {
                if (child instanceof HTMLElement && child.classList.contains('mermaid-source')) {
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

  return <></>
}
