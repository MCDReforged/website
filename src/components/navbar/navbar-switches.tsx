'use client'

import React, { useState } from "react";
import { LocaleSwitch } from "./locale-switch";
import { NavbarSwitchStateContext } from "./navbar-switch-state";
import { ThemeSwitch } from "./theme-switch";

export function NavbarSwitches() {
  const [openedSwitchKey, setOpenedSwitchKey] = useState<string>("")
  return (
    <NavbarSwitchStateContext.Provider value={{
      shouldOpen: key => openedSwitchKey === key,
      setOpen: (key, opened) => {
        if (opened) {
          setOpenedSwitchKey(key)
        } else {
          setOpenedSwitchKey(existing => {
            return existing === key ? "" : existing
          })
        }
      },
    }}>
      <LocaleSwitch/>
      <ThemeSwitch/>
    </NavbarSwitchStateContext.Provider>
  )
}
