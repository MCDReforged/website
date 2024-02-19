'use client'

import { useEffect } from "react";

// https://github.com/vercel/next.js/issues/45187
// https://github.com/vercel/next.js/issues/45187#issuecomment-1639518030
export function LayoutScrollFix({pluginId}: {pluginId: string}) {
 	useEffect(() => {
 		window.scroll(0, 0)
 	}, [pluginId]);
 	return <></>;
}
