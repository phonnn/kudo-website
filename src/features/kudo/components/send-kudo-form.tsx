"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/errors/api-error";
import { useApi } from "@/providers/app-providers";
import { useSendKudo } from "../hooks/use-send-kudo";

export function SendKudoForm() {
  const api = useApi();
  const users = useQuery({ queryKey: ["users"], queryFn: () => api.getUsers() });
  const sendKudo = useSendKudo();
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    sendKudo.mutate({
      recipientId: String(data.get("recipientId")),
      message,
      points: Number(data.get("points")),
      coreValue: String(data.get("coreValue")),
    }, { onSuccess: () => setMessage("") });
  }

  return (
    <form className="card composer" onSubmit={submit}>
      <div className="eyebrow">Recognize someone</div>
      <h2>Send a good job</h2>
      <div className="form-grid">
        <label>To<select name="recipientId" required defaultValue=""><option value="" disabled>Choose a teammate</option>{users.data?.slice(1).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label>
        <label>Points<select name="points" defaultValue="10"><option>5</option><option>10</option><option>15</option><option>25</option></select></label>
      </div>
      <label>Core value<select name="coreValue" defaultValue="Own the outcome"><option>Own the outcome</option><option>Customer first</option><option>Better together</option></select></label>
      <label>Your message<textarea required minLength={8} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What did they do that deserves recognition?" /></label>
      {sendKudo.error && <p className="error">{sendKudo.error instanceof ApiError ? sendKudo.error.message : "Something went wrong."}</p>}
      <button disabled={sendKudo.isPending}>{sendKudo.isPending ? "Sending…" : "Send recognition"}</button>
    </form>
  );
}
