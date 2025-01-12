"use client";

import { type CoreMessage } from "ai";
import { useState } from "react";
import { continueTextConversation } from "@/app/actions";
import { readStreamableValue } from "ai/rsc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconArrowUp } from "@/components/ui/icons";
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
  });

  let [messages, setMessages] = useState<CoreMessage[]>([]);
  let [input, setInput] = useState<string>("");
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
    });

  let handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    let newMessages: CoreMessage[] = [
      ...messages,
      {
        role: "user",
        content: JSON.stringify(
          {
            input,
            formData,
          },
          null,
          2
        ), // Pretty print JSON for better readability
      },
    ];

    setInput("");
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
    <div className="group w-full overflow-auto px-2">
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
        <form onSubmit={handleSubmit}>
          <div className="w-full max-w-xl mx-auto">
            <TripPlannerForm formData={formData} setFormData={setFormData} />
            <div className="flex">
              <Input
                type="text"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mr-2"
                placeholder={`Anything else?`}
              />
              <Button>
                <IconArrowUp />
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
