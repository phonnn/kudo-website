"use client";

import { useId, useState, type FocusEvent, type KeyboardEvent } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Text } from "./text";

export type ComboboxOption = {
  value: string;
  label: string;
};

type ComboboxProps = {
  value: string;
  search: string;
  options: ComboboxOption[];
  placeholder: string;
  emptyMessage: string;
  onSearchChange(value: string): void;
  onValueChange(value: string): void;
};

export function Combobox({
  value,
  search,
  options,
  placeholder,
  emptyMessage,
  onSearchChange,
  onValueChange,
}: ComboboxProps) {
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  function select(option: ComboboxOption) {
    onValueChange(option.value);
    onSearchChange(option.label);
    setOpen(false);
  }

  function updateSearch(nextSearch: string) {
    onSearchChange(nextSearch);
    onValueChange("");
    setActiveIndex(0);
    setOpen(true);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter" && open && options[activeIndex]) {
      event.preventDefault();
      select(options[activeIndex]);
    }
  }

  function closeWhenFocusLeaves(event: FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;

    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
      return;
    }

    setOpen(false);
  }

  return (
    <div className="combobox" onBlur={closeWhenFocusLeaves}>
      <div className="combobox-control">
        <Input
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={open}
          value={search}
          placeholder={placeholder}
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(event) => updateSearch(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type="button"
          variant="icon"
          aria-label="Toggle teammate options"
          onClick={() => setOpen((current) => !current)}
        >
          <Text as="span">⌄</Text>
        </Button>
      </div>

      {open && (
        <div className="combobox-popover" id={listboxId} role="listbox">
          {options.map((option, index) => {
            let className = "combobox-option";

            if (index === activeIndex) {
              className += " active";
            }

            if (option.value === value) {
              className += " selected";
            }

            return (
              <Button
                type="button"
                variant="ghost"
                className={className}
                role="option"
                aria-selected={option.value === value}
                key={option.value}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(option)}
              >
                <Text as="span">{option.label}</Text>
                {option.value === value && <Text as="span">✓</Text>}
              </Button>
            );
          })}

          {!options.length && <Text className="combobox-empty">{emptyMessage}</Text>}
        </div>
      )}
    </div>
  );
}
