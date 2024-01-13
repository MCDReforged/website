import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="w-full flex flex-col items-center justify-center py-3">
      <div className="items-center my-1">
        <p className="text-sm">
          <>Copyright © {year} </>
          <Link target="_blank" href="https://github.com/Fallen-Breath">Fallen_Breath</Link>
        </p>
      </div>
    </footer>
  )
}
