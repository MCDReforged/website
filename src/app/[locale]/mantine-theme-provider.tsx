'use client';

import { siteTheme } from "@/site/theme";
import { CSSVariablesResolver, MantineProvider } from "@mantine/core";
import React from "react";

const resolver: CSSVariablesResolver = (theme) => ({
  variables: {
  },
  light: {
  },
  dark: {
    '--mantine-color-default': theme.colors.dark[7],
    '--mantine-color-body': theme.colors.dark[8],
  },
})

export default function MantineThemeProvider({children}: {children: React.ReactNode}) {
  // the theme variable contains a function, which is not serializable,
  // so we need to wrap this provider in a client component
  return (
    <MantineProvider theme={siteTheme} defaultColorScheme="auto" cssVariablesResolver={resolver}>
      {children}
    </MantineProvider>
  );
}
