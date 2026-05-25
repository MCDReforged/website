import { createTheme, darken, defaultVariantColorsResolver, parseThemeColor, rem, rgba, VariantColorResolverResult, VariantColorsResolver } from "@mantine/core";

// https://mantine.dev/core/badge/#customize-variants-colors
export const variantColorResolver: VariantColorsResolver = (input) => {
  let result: VariantColorResolverResult

  if (input.variant === 'light-bordered') {
    result = defaultVariantColorsResolver({...input, variant: 'light'})
    const parsedColor = parseThemeColor({
      color: input.color || input.theme.primaryColor,
      theme: input.theme,
    })
    result.border = `${rem(1)} solid ${rgba(parsedColor.value, 0.7)}`
    result.color = darken(parsedColor.value, 0.1)

    // Mantine 9 changed the `light` variant to use solid colors instead of transparency.
    // Restore the Mantine 8.x-style transparent backgrounds explicitly.
    result.background = rgba(parsedColor.value, 0.1)
    result.hover = rgba(parsedColor.value, 0.12)

  } else {
    result = defaultVariantColorsResolver(input)
  }

  return result;
}

export const siteTheme = createTheme({
  // github-like fonts
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
  primaryColor: 'indigo',
  cursorType: 'pointer',
  variantColorResolver: variantColorResolver,
  // Mantine 9.x changed defaultRadius from 'sm' (4px) to 'md' (8px); keep the previous value
  defaultRadius: 'sm',
})
