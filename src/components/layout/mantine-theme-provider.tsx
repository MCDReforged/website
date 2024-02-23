'use client';

import { theme } from "@/config/theme";
import { MantineProvider } from "@mantine/core";
import React from "react";

export default function MantineThemeProvider({children}: {children: React.ReactNode}) {
  // the theme variable contains a function, which is not serializable,
  // so we need to wrap this provider in a client component
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      {children}
    </MantineProvider>
  );
}
