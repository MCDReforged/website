import { CommonCopyButton, CommonCopyButtonProps } from "@/components/common-copy-button";
import { CopyButtonProps } from "@mantine/core";
import { getTranslations } from "next-intl/server";

export type HashCopyButtonProps = Omit<CopyButtonProps, 'children'> & {
  iconSize?: number
}

export async function HashCopyButton(props: HashCopyButtonProps) {
  const t = await getTranslations('page.plugin.release')
  const ccbProps: CommonCopyButtonProps = {
    ...props,
    labelCopy: t('copy_hash'),
    labelCopied: t('copied_hash'),
  }
  return <CommonCopyButton {...ccbProps}/>
}
