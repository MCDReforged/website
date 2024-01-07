// https://github.com/nextui-org/nextui/issues/1403

"use client"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react"

export function MyDropdown() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">
          Sort order
        </Button>
      </DropdownTrigger>
      <DropdownMenu selectionMode="single">
        <DropdownItem key="name">New file</DropdownItem>
        <DropdownItem key="updates">Copy link</DropdownItem>
        <DropdownItem key="downloads">Edit file</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}