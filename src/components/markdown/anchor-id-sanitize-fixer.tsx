'use client'
import { useEffect } from "react";

export function AnchorIdSanitizeFixer() {
  useEffect(() => {
    // https://github.com/rehypejs/rehype-slug?tab=readme-ov-file#security
    // https://github.com/rehypejs/rehype-autolink-headings?tab=readme-ov-file#security
    // https://github.com/rehypejs/rehype-sanitize?tab=readme-ov-file#example-headings-dom-clobbering

    function handleHashChange() {
      let hash: string | undefined
      try {
        hash = decodeURIComponent(location.hash.slice(1)).toLowerCase()
      } catch {
        return
      }

      const target = document.getElementById('user-content-' + hash)
      if (target) {
        setTimeout(() => target.scrollIntoView(), 0)
      }
    }

    function handleClick(event: MouseEvent) {
      if (
        event.target &&
        event.target instanceof HTMLAnchorElement &&
        event.target.href === location.href &&
        location.hash.length > 1
      ) {
        setTimeout(function () {
          if (!event.defaultPrevented) {
            handleHashChange()
          }
        }, 0)
      }
    }

    // Page load (you could wrap this in a DOM ready if the script is loaded early).
    handleHashChange()

    // When URL changes.
    window.addEventListener('hashchange', handleHashChange)

    // When on the URL already, perhaps after scrolling, and clicking again, which
    // doesn’t emit `hashchange`.
    document.addEventListener('click', handleClick, false)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      document.removeEventListener('click', handleClick, false)
    }
  }, [])
  return <></>
}
