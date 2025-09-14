"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search, Hash, TrendingUp, Settings, Filter, Bell } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = React.useState("")

  const commands = [
    {
      group: "Signals",
      items: [
        { icon: TrendingUp, label: "View All Signals", shortcut: "⌘S" },
        { icon: Filter, label: "Filter Signals", shortcut: "⌘F" },
        { icon: Hash, label: "Search Symbol", shortcut: "⌘/" },
      ],
    },
    {
      group: "Settings",
      items: [
        { icon: Bell, label: "Notification Settings", shortcut: "⌘N" },
        { icon: Settings, label: "Preferences", shortcut: "⌘," },
      ],
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <CommandPrimitive className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search signals, symbols, or commands..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandPrimitive.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <CommandPrimitive.Empty className="py-6 text-center text-sm">No results found.</CommandPrimitive.Empty>

            {commands.map((group) => (
              <CommandPrimitive.Group key={group.group} heading={group.group}>
                {group.items.map((item) => (
                  <CommandPrimitive.Item
                    key={item.label}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs tracking-widest text-muted-foreground">{item.shortcut}</span>
                  </CommandPrimitive.Item>
                ))}
              </CommandPrimitive.Group>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}
