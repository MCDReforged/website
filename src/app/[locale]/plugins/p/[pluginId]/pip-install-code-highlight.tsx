import { CodeHighlightTabs } from "@mantine/code-highlight";
import React from "react";
import '@mantine/code-highlight/styles.css';

export default function PipInstallCodeHighlight({requirements}: {requirements: string[]}) {
  const pipInstallCommand = 'pip install ' + requirements.map(req => {
    if (req.match(/^[a-zA-Z0-9.~^=_-]+$/)) {
      return req
    }
    return '"' + req.replace('"', '\\"') + '"'
  }).join(' ')

  return (
    <CodeHighlightTabs
      code={[
        { fileName: 'Windows', code: pipInstallCommand, language: 'bash' },
        { fileName: 'Linux', code: pipInstallCommand.replace(/^pip/, 'pip3'), language: 'bash' },
      ]}/>
  )
}