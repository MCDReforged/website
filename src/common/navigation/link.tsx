'use client'

import { onStart } from "@/common/nprogress/events";
import { shouldTriggerStartEvent } from "@/common/nprogress/should-trigger-start-event";
import { i18nNavigation } from "@/i18n/routing";
import { forwardRef } from "react";

export const Link = forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(function Link(
  { href, onClick, ...rest },
  ref,
) {
  const useLink = href && href.startsWith("/");
  if (!useLink) return <a href={href} onClick={onClick} {...rest} />;

  const pathName = i18nNavigation.usePathname()
  return (
    <i18nNavigation.Link
      href={href}
      onClick={(event) => {
        if (shouldTriggerStartEvent(pathName, href, event)) {
          onStart()
        }
        if (onClick) {
          onClick(event)
        }
      }}
      {...rest}
      ref={ref}
    />
  );
});
