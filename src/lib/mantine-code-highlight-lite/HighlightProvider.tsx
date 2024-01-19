import { HLJSApi } from 'highlight.js';
import React, { createContext, PropsWithChildren, useEffect } from 'react';

interface HighlightContextType {
  hljs?: HLJSApi;
}

export const HighlightContext = createContext<HighlightContextType>({
  hljs: undefined,
});

export const HighlightProvider = ({
  children,
  hljsInstance,
}: PropsWithChildren<{
  hljsInstance: HLJSApi;
}>) => {
  const [hljs, setHljs] = React.useState(hljsInstance);

  useEffect(() => {
    setHljs(hljsInstance);
  }, [hljsInstance]);

  return <HighlightContext.Provider value={{ hljs }}>{children}</HighlightContext.Provider>;
};
