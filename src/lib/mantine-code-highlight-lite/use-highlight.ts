import { useCallback, useContext, useEffect, useState } from 'react';
import { HighlightContext } from './HighlightProvider';

interface UseHighlightInput {
  code: string;
  language: string;
  highlightOnClient: boolean | undefined;
}

export function useHighlight({ code, language, highlightOnClient }: UseHighlightInput) {
  const { hljs } = useContext(HighlightContext);

  const lang = hljs?.getLanguage(language) ? language : 'plaintext';

  const getHighlightedCode = useCallback(
    () => hljs!.highlight(code.trim(), { language: lang }).value,
    [hljs, code, lang]
  );
  const [highlighted, setHighlighted] = useState(!highlightOnClient);
  const [highlightedCode, setHighlightedCode] = useState(
    highlightOnClient ? code : getHighlightedCode()
  );

  const getCodeProps = () =>
    highlighted
      ? { dangerouslySetInnerHTML: { __html: highlightedCode } }
      : { children: code.trim() };

  useEffect(() => {
    if (highlightOnClient) {
      setHighlightedCode(getHighlightedCode());
      setHighlighted(true);
    }
  }, [getHighlightedCode, highlightOnClient]);

  useEffect(() => {
    setHighlightedCode(getHighlightedCode());
  }, [code, getHighlightedCode]);

  return getCodeProps;
}
