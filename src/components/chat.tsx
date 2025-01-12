"use client";

import { type CoreMessage } from "ai";
import { useState } from "react";
import { continueTextConversation } from "@/app/actions";
import { readStreamableValue } from "ai/rsc";
import { Button } from "@/components/ui/button";
import { TripPlannerForm } from "./TripPlannerForm";

export let maxDuration = 30;

export default function Chat() {
  let [messages, setMessages] = useState<CoreMessage[]>([]);
  let clearMessages = () => setMessages([]);
  let clearFormData = () =>
    (document.querySelector("#tripPlannerForm") as HTMLFormElement)?.reset();
  let handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    let formData = new FormData(e?.target as HTMLFormElement);
    let formDataObject = Object.fromEntries(formData.entries());
    let newMessages: CoreMessage[] = [
      ...messages,
      {
        role: "user",
        content: JSON.stringify({ formData: formDataObject }),
      },
    ];

    let result = await continueTextConversation(newMessages);
    for await (let content of readStreamableValue(result)) {
      setMessages([
        // ...newMessages,
        {
          role: "assistant",
          content: content as string,
        },
      ]);
    }
  };

  return (
    <div className="group w-full overflow-auto px-2 pb-4">
      <div className="max-w-xl mx-auto mt-10">
        {messages.map((message, index) => (
          <div key={index} className="whitespace-pre-wrap flex mb-5">
            <div
              className={`${
                message.role === "user"
                  ? "bg-slate-200 ml-auto"
                  : "bg-transparent"
              } p-2 rounded-lg`}
            >
              {message.content as string}
            </div>
          </div>
        ))}
        {!!messages.length && (
          <div className="flex gap-4 w-full justify-end">
            <Button onClick={handleSubmit}>Regenerate</Button>
            <Button
              onClick={() => {
                clearMessages();
                clearFormData();
              }}
            >
              Reset
            </Button>
          </div>
        )}
      </div>
      {!messages.length && <TripPlannerForm handleSubmit={handleSubmit} />}
    </div>
  );
}
