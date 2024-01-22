import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

const revalidateToken = process.env.MW_REVALIDATE_CATALOGUE_TOKEN

export async function POST(request: NextRequest) {
  if (revalidateToken === undefined) {
    return new Response('unsupported', {status: 400})
  }

  if (request.headers.get('Authorization') !== `Bearer ${revalidateToken}`) {
    return new Response('Unauthorized', {status: 401})
  }

  // References for path usages
  // 1. https://nextjs.org/docs/app/api-reference/functions/revalidatePath
  // 2. https://github.com/vercel/next.js/blob/bd605245aae4c8545bdd38a597b89ad78ca3d978/packages/next/src/server/lib/patch-fetch.ts#L78
  revalidatePath('/[locale]/plugins', 'layout')

  const msg: string = 'All catalogue pages are revalidated'
  console.log(msg)
  return Response.json({
    code: 0,
    now: Date.now(),
    message: msg,
  })
}
