"use client";
import { useRef, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/errors/api-error";
import { useApi } from "@/providers/app-providers";
import type { MediaView, Tag } from "../types";
import { useSendKudo } from "../hooks/use-send-kudo";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { FormSurface } from "@/components/ui/form-surface";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { useToast } from "@/components/ui/toast-provider";
import { TeammatePicker } from "./teammate-picker";
import { ImagePicker } from "./image-picker";

const tags: Array<{ value: Tag; label: string }> = [
  { value: "teamwork", label: "Better together" },
  { value: "ownership", label: "Own the outcome" },
  { value: "innovation", label: "Keep innovating" },
  { value: "customer_focus", label: "Customer first" },
];

export function SendKudoForm() {
  const api = useApi();
  const { showToast } = useToast();
  const sendKudo = useSendKudo();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let media: MediaView | undefined;

    setUploadError("");

    try {
      if (file) {
        setUploading(true);
        const upload = await api.presignMedia(file.type);
        await api.uploadMedia(upload, file);
        media = {
          objectKey: upload.objectKey,
          domain: upload.domain,
          previewUrl: preview ?? undefined,
        };
      }
      sendKudo.mutate(
        {
          recipientId: String(data.get("recipientId")),
          message,
          points: Number(data.get("points")),
          tag: String(data.get("tag")) as Tag,
          media,
        },
        {
          onSuccess: () => {
            if (preview) {
              URL.revokeObjectURL(preview);
            }

            setMessage("");
            setFile(null);
            setPreview(null);
            formRef.current?.reset();
          },
          onError: (reason) => {
            if (reason instanceof Error) {
              showToast(reason.message);
            } else {
              showToast("Could not send recognition.");
            }
          },
        },
      );
    } catch (reason) {
      if (reason instanceof Error) {
        setUploadError(reason.message);
        showToast(reason.message);
      } else {
        setUploadError("Could not upload the image.");
        showToast("Could not upload the image.");
      }
    } finally {
      setUploading(false);
    }
  }

  function chooseFile(next: File | null) {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(next);
    setUploadError("");

    if (next) {
      setPreview(URL.createObjectURL(next));
    } else {
      setPreview(null);
    }
  }

  let errorMessage = "";

  if (sendKudo.error instanceof ApiError) {
    errorMessage = sendKudo.error.message;
  } else if (sendKudo.error) {
    errorMessage = "Something went wrong.";
  }

  let submitLabel = "Send recognition";

  if (sendKudo.isPending) {
    submitLabel = "Sending…";
  }

  if (uploading) {
    submitLabel = "Uploading…";
  }

  return (
    <FormSurface ref={formRef} className="composer" onSubmit={submit}>
      <Eyebrow>Recognize someone</Eyebrow>
      <Heading>Send a good job</Heading>
      <div className="form-grid">
        <Field label="To">
          <TeammatePicker />
        </Field>
        <Field label="Points">
          <Input
            name="points"
            type="number"
            min={10}
            max={50}
            step={1}
            defaultValue={10}
            required
          />
        </Field>
      </div>
      <Field label="Tag">
        <Select name="tag" defaultValue="ownership">
          {tags.map((tag) => (
            <option key={tag.value} value={tag.value}>
              {tag.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Your message">
        <Textarea
          required
          minLength={1}
          maxLength={2000}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="What did they do that deserves recognition?"
        />
      </Field>
      <Field className="media-picker" label="Photo" hint="optional">
        <ImagePicker fileName={file?.name} preview={preview} onChange={chooseFile} />
      </Field>
      {uploadError && <FormError>{uploadError}</FormError>}
      {errorMessage && <FormError>{errorMessage}</FormError>}
      <Button type="submit" disabled={sendKudo.isPending || uploading}>
        {submitLabel}
      </Button>
    </FormSurface>
  );
}
