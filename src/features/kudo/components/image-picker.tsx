"use client";
/* eslint-disable @next/next/no-img-element -- local blob previews are not optimizable assets */

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

type ImagePickerProps = {
  fileName?: string;
  preview: string | null;
  onChange(file: File | null): void;
};

export function ImagePicker({ fileName, preview, onChange }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  let buttonLabel = "Choose image";

  if (fileName) {
    buttonLabel = "Change image";
  }

  function openFileDialog() {
    inputRef.current?.click();
  }

  function removeImage() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onChange(null);
  }

  return (
    <div className="image-picker">
      <Input
        ref={inputRef}
        className="image-picker-input"
        type="file"
        accept="image/*"
        tabIndex={-1}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />

      <div className="image-picker-control">
        <Button type="button" variant="ghost" onClick={openFileDialog}>
          {buttonLabel}
        </Button>
        <Text as="small">{fileName ?? "No image selected"}</Text>
      </div>

      {preview && (
        <div className="media-preview">
          <img src={preview} alt="Upload preview" />
          <Button variant="ghost" aria-label="Remove selected image" onClick={removeImage}>
            × Remove
          </Button>
        </div>
      )}
    </div>
  );
}
