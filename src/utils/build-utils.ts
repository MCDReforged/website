// limit the count of the static pages to avoid the build time being too long during CI
// we still keep a few generateStaticParams() here to validate that the pages are build-able
export const staticParamsMaxSize = 10
