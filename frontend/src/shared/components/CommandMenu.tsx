import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  BookOpen,
  Compass,
  UploadCloud,
  Sparkles,
  Award,
  Layers,
  Settings,
  User,
  Moon,
  Sun,
  Laptop
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/shared/components/ui/command"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenUploadModal?: () => void
  onOpenVocabModal?: () => void
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  open,
  onOpenChange,
  onOpenUploadModal,
  onOpenVocabModal
}) => {
  const navigate = useNavigate()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const runCommand = (command: () => void) => {
    onOpenChange(false)
    command()
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search IELTS modules, roadmaps, exams..." />
      <CommandList>
        <CommandEmpty>No matching results found.</CommandEmpty>
        
        {/* Navigation Section */}
        <CommandGroup heading="IELTS Modules & Practice">
          <CommandItem
            onSelect={() => runCommand(() => navigate("/reading"))}
          >
            <BookOpen className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
            <span>IELTS Reading Practice Hub</span>
            <CommandShortcut>⌘R</CommandShortcut>
          </CommandItem>

          <CommandItem
            onSelect={() => runCommand(() => navigate("/reading"))}
          >
            <Compass className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Band Mastery Roadmaps (Band 0 – 8.5+)</span>
          </CommandItem>

          <CommandItem
            onSelect={() => {
              if (onOpenVocabModal) {
                runCommand(() => onOpenVocabModal())
              } else {
                runCommand(() => navigate("/reading"))
              }
            }}
          >
            <Layers className="mr-2 h-4 w-4 text-amber-500" />
            <span>IELTS Band Vocabulary Flashcards</span>
          </CommandItem>

          <CommandItem
            onSelect={() => {
              if (onOpenUploadModal) {
                runCommand(() => onOpenUploadModal())
              } else {
                runCommand(() => navigate("/reading"))
              }
            }}
          >
            <UploadCloud className="mr-2 h-4 w-4 text-red-500" />
            <span>Upload & Convert Custom Exam</span>
            <CommandShortcut>⌘U</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Roadmaps Jump */}
        <CommandGroup heading="Band Roadmaps Quick Jump">
          <CommandItem onSelect={() => runCommand(() => navigate("/reading"))}>
            <Award className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Pre-IELTS (Band 0 – 3.5) Foundation</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/reading"))}>
            <Award className="mr-2 h-4 w-4 text-sky-500" />
            <span>Band 4.0 – 4.5 Scanning Bootcamp</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/reading"))}>
            <Award className="mr-2 h-4 w-4 text-amber-500" />
            <span>Band 5.0 – 5.5 TFNG Traps Master</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/reading"))}>
            <Award className="mr-2 h-4 w-4 text-orange-500" />
            <span>Band 6.0 – 6.5 Headings & Timing</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/reading"))}>
            <Award className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Band 7.0 – 7.5 Academic Nuances & Inversions</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/reading"))}>
            <Award className="mr-2 h-4 w-4 text-purple-500" />
            <span>Band 8.0 – 8.5+ Epistemological Perfectionist</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Settings & Preferences */}
        <CommandGroup heading="Account & System">
          <CommandItem onSelect={() => runCommand(() => navigate("/reading"))}>
            <User className="mr-2 h-4 w-4 text-zinc-400" />
            <span>User Profile & Target Band Score</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
