'use client'

import { useEffect } from "react";
import styles from "./highlight-js-hook.module.css"

export function HighlightJsHook({ignoredLanguages}: {ignoredLanguages?: string[]}) {
  useEffect(() => {
    const highlightCodes = async () => {
      const elements: {el: HTMLElement, lang: string}[] = []
      const languages = new Set<string>()
      document.querySelectorAll('pre code').forEach((el) => {
        if (el instanceof HTMLElement) {
          el.classList.forEach(clazz => {
            const match = clazz.match(/^language-(\w+)$/)
            if (match && !(ignoredLanguages || []).includes(match[1])) {
              elements.push({el: el, lang: match[1]})
              languages.add(match[1])
            }
          })
        }
      })

      if (elements.length === 0) {
        return
      }

      // yeah, it's a bit huge (~254KiB gzipped for v11.9.0), but it's after the rendered, so it's fine
      let hljs = (await import('highlight.js')).default
      hljs.registerAliases(['json5', 'hjson'], {languageName: 'json'})

      for (const {el, lang} of elements) {
        if (hljs.getLanguage(lang)) {
          hljs.highlightElement(el)
          el.classList.add(styles.root)
        }
      }
    }

    highlightCodes().catch(e => console.error('highlight codes error', e))
  })
  return <></>
}
