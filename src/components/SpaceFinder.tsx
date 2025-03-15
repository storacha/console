import type { Space } from "@w3ui/react"

import React, { Fragment, useState } from "react"
import { Combobox, Transition } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"
import { shortenDID } from "@/lib"

interface SpaceFinderProps {
  spaces: Space[]
  selected?: Space
  setSelected?: (space: Space) => void
  className?: string
}

export function SpaceFinder({
  spaces,
  selected,
  setSelected,
  className = "",
}: SpaceFinderProps): JSX.Element {
  const [query, setQuery] = useState("")
  const filtered =
    query === ""
      ? spaces
      : spaces.filter((space: Space) =>
          (space.name || space.did())
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, ""))
        )

  return (
    <div className={`${className}`}>
      <Combobox
        value={selected}
        onChange={setSelected}
        by={(a, b) => a?.did() === b?.did()}
      >
        <div className="relative mt-1">
          <div className="relative w-full overflow-hidden rounded-md bg-white text-left shadow-md">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm text-gray-900"
              displayValue={(space: Space) =>
                space.name || shortenDID(space.did())
              }
              onChange={(event) => {
                setQuery(event.target.value)
              }}
              placeholder="Select your space"
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pl-1 pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => {
              setQuery("")
            }}
          >
            <Combobox.Options
              className="absolute mt-1 max-h-96 w-full bg-white rounded-md pt-1 shadow-lg overflow-scroll z-10"
              static
            >
              {filtered.length === 0 && query !== "" ? (
                <div className="relative select-non py-2 px-4 font-mono text-sm text-red-500">
                  (╯°□°)╯︵ ┻━┻
                </div>
              ) : (
                filtered.map((space) => (
                  <Combobox.Option
                    key={space.did()}
                    className={({ active }) =>
                      `relative select-none py-2 pl-9 pr-4 ${
                        active
                          ? "bg-hot-yellow-light cursor-pointer text-hot-red"
                          : "text-black"
                      }`
                    }
                    value={space}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block overflow-hidden text-ellipsis whitespace-nowrap ${
                            selected ? "font-medium" : ""
                          }`}
                        >
                          {space.name || shortenDID(space.did())}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "" : ""
                            }`}
                          >
                            ⁂
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
}
