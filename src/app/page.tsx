import { Link } from "@nextui-org/link";
import { button as buttonStyles } from "@nextui-org/theme";
import { siteConfig } from "@/config/site";
import { subtitle, title } from "@/components/primitives";
import { GithubIcon, ReadTheDocsIcon } from "@/components/icons";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>
          MCDReforged
        </h1>
        <h2 className={subtitle({class: "mt-4"})}>
          A rewritten version of MCDaemon, a python tool to control your Minecraft server
        </h2>
      </div>

      <div className="flex gap-3">
        <Link
          isExternal
          href={siteConfig.links.docs}
          className={buttonStyles({variant: "bordered", radius: "full", color: "primary"})}
        >
          <ReadTheDocsIcon size={20} color={"primary"}/>
          Documentation
        </Link>
        <Link
          isExternal
          className={buttonStyles({variant: "bordered", radius: "full"})}
          href={siteConfig.links.github}
        >
          <GithubIcon size={20}/>
          GitHub
        </Link>
      </div>
    </section>
  );
}
