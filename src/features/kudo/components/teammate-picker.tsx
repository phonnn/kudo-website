"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { useApi } from "@/providers/app-providers";

export function TeammatePicker() {
  const api = useApi();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search]);

  const teammates = useQuery({
    queryKey: ["users", debouncedSearch],
    queryFn: () => api.getUsers(debouncedSearch),
  });
  const options =
    teammates.data?.map((teammate) => ({
      value: teammate.id,
      label: teammate.name,
    })) ?? [];
  let emptyMessage = "No teammates found.";

  if (teammates.isPending) {
    emptyMessage = "Loading teammates…";
  }

  if (teammates.isError) {
    emptyMessage = "Could not load teammates.";
  }

  return (
    <>
      <Combobox
        value={value}
        search={search}
        options={options}
        placeholder="Choose a teammate"
        emptyMessage={emptyMessage}
        onSearchChange={setSearch}
        onValueChange={setValue}
      />
      <Input type="hidden" name="recipientId" value={value} required />
    </>
  );
}
