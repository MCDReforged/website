import {Link} from "@nextui-org/link";
import {NextUILogo} from "./icons";

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="w-full flex flex-col items-center justify-center py-3">
      <div className="items-center my-1">
        <p className="text-sm">Copyright © {year} Fallen_Breath</p>
      </div>

      <div className="gap-1">
        <Link
          isExternal
          className="flex items-center text-current"
          href="https://nextui.org/"
        >
          <p className="text-sm text-default-600">Powered by</p>
          <NextUILogo className="ml-2" height={12}/>
        </Link>
      </div>
    </footer>
  )
}
