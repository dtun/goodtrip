"use client";

import { type CoreMessage } from "ai";
import { useState } from "react";
import { continueTextConversation } from "@/app/actions";
import { readStreamableValue } from "ai/rsc";
import { Button } from "@/components/ui/button";
import { TripFormData, TripPlannerForm } from "./TripPlannerForm";

export let maxDuration = 30;

export default function Chat() {
  let [formData, setFormData] = useState<TripFormData>({
    destination: "",
    duration: "",
    numChildren: "",
    childrenAges: "",
    budget: "",
    pace: "",
    season: "",
    mobility: "",
    activities: "",
    additionalInfo: "",
  });

  let [messages, setMessages] = useState<CoreMessage[]>([]);
  let clearMessages = () => setMessages([]);
  let clearFormData = () =>
    setFormData({
      destination: "",
      duration: "",
      numChildren: "",
      childrenAges: "",
      budget: "",
      pace: "",
      season: "",
      mobility: "",
      activities: "",
      additionalInfo: "",
    });

  let handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    let newMessages: CoreMessage[] = [
      ...messages,
      {
        role: "user",
        content: JSON.stringify({ formData }, null, 2), // Pretty print JSON for better readability
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
      {!messages.length && (
        <TripPlannerForm
          formData={formData}
          handleSubmit={handleSubmit}
          setFormData={setFormData}
        />
      )}
    </div>
  );
}
