import { ExecOptions } from "child_process";
import fs from "fs/promises"
import { exec } from "node:child_process"
import { promisify } from "node:util"

interface GitInfo {
  branch: string
  commitHash: string
}

let cachedGitInfo: GitInfo | undefined | null = null

export async function getGitInfo(): Promise<GitInfo | undefined> {
  if (cachedGitInfo === null) {
    cachedGitInfo = await getGitInfoImpl()
  }
  return cachedGitInfo
}

async function tryGetGitInfoFromCommand(): Promise<GitInfo | undefined> {
  try {
    const execAsync = promisify(exec)

    const execOptions: ExecOptions = { timeout: 1500 }
    const [branchResult, commitHashResult] = await Promise.all([
      execAsync('git rev-parse --abbrev-ref HEAD', execOptions),
      execAsync('git rev-parse HEAD', execOptions)
    ])

    const branch = branchResult.stdout.trim()
    const commitHash = commitHashResult.stdout.trim()
    if (branch && commitHash) {
      return { branch, commitHash }
    }
  } catch {
    return undefined
  }
}

async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    const st = await fs.stat(filePath)
    return st.isFile()
  } catch {
    return false
  }
}

async function getGitInfoFromFile(): Promise<GitInfo | undefined> {
  const filePath = 'git-info.json'
  try {
    if (await checkFileExists(filePath)) {
      const data = await fs.readFile(filePath, 'utf8')
      const gitInfo: GitInfo = JSON.parse(data)
      if (gitInfo.branch && gitInfo.commitHash) {
        return gitInfo
      }
    }
  } catch (error) {
    console.error('Failed to read or parse git-info.json:', error)
  }
  return undefined
}

function getEnvVar(...keys: string[]): string | undefined {
  for (const key of keys) {
    if (process.env[key]) {
      return process.env[key]
    }
  }
}

function gitRefToBranch(gitRef: string): string {
  const mappings = [
    {prefix: 'refs/heads/', append: ''},
    {prefix: 'refs/tags/', append: ''},
    {prefix: 'refs/pull/', append: 'pr-'},
  ]

  for (const {prefix, append} of mappings) {
    if (gitRef.startsWith(prefix)) {
      return append + gitRef.substring(prefix.length)
    }
  }
  return gitRef
}

async function getGitInfoImpl(): Promise<GitInfo | undefined> {
  if (process.env.NODE_ENV === 'development') {
    return (await tryGetGitInfoFromCommand()) || {
      branch: 'test',
      commitHash: 'abc',
    }
  }

  const gitInfoFromFile = await getGitInfoFromFile()
  if (gitInfoFromFile) {
    return gitInfoFromFile
  }

  const gitRef = getEnvVar('GIT_REF', 'GITHUB_REF')
  const commitHash = getEnvVar('GIT_COMMIT_HASH', 'GITHUB_SHA', 'VERCEL_GIT_COMMIT_SHA')
  const branch = gitRef ? gitRefToBranch(gitRef) : getEnvVar('VERCEL_GIT_COMMIT_REF')

  return (branch && commitHash) ? {branch, commitHash} : undefined
}
