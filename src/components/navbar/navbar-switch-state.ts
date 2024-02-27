import { createContext } from "react";

export interface NavbarSwitchStateContextValue {
  shouldOpen(key: string): boolean
  setOpen: (key: string, value: boolean) => void
}

export const NavbarSwitchStateContext = createContext<NavbarSwitchStateContextValue>({
  shouldOpen: k => false,
  setOpen: (k, opened) => {},
})
