import { GithubIcon, ReadTheDocsIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { Button, Container, Group, Text } from '@mantine/core';
import Link from "next/link";

function HeroTitle() {
  return (
    <div className="">
      <Container size={700} className="">
        <h1 className="">
          A{' '}
          <Text component="span" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} inherit>
            fully featured
          </Text>{' '}
          React components and hooks library
        </h1>

        <Text className="" color="dimmed">
          Build fully functional accessible web applications with ease – Mantine includes more than
          100 customizable components and hooks to cover you in any situation
        </Text>

        <Group className="">
          <Button
            size="xl"
            className=""
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan' }}
          >
            Get started
          </Button>

          <Button
            component="a"
            href="https://github.com/mantinedev/mantine"
            size="xl"
            variant="default"
            className=""
            leftSection={<GithubIcon size={20} />}
          >
            GitHub
          </Button>
        </Group>
      </Container>
    </div>
  );
}

export default function Home() {
  // return <HeroTitle />
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <p className="text-5xl font-semibold">
          MCDReforged
        </p>
        <p className="text-xl mt-4">
          A rewritten version of MCDaemon, a python tool to control your Minecraft server
        </p>
      </div>
      <Button>Light</Button>

      <div className="flex gap-3">
        <Link
          target="_blank"
          href={siteConfig.links.docs}
        >
          <Button leftSection={<ReadTheDocsIcon size={18} color={"primary"}/>} variant="default">
            Documentation
          </Button>
        </Link>
        <Link
          target="_blank"
          href={siteConfig.links.github}
        >
          <Button leftSection={<GithubIcon size={20}/>} variant="default">
            GitHub
          </Button>
        </Link>
      </div>
    </div>
  )
}
