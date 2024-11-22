"use client";

import { Card } from "@/components/ui/card";
import { type CoreMessage } from "ai";
import { useState } from "react";
import { continueTextConversation } from "@/app/actions";
import { readStreamableValue } from "ai/rsc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconArrowUp } from "@/components/ui/icons";
import { TripFormData, TripPlannerForm } from "./TripPlannerForm";
export const maxDuration = 30;

export default function Chat() {
  const [formData, setFormData] = useState<TripFormData>({
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

  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: JSON.stringify({ input, formData }), role: "user" },
    ];
    // setMessages(newMessages);
    setInput("");
    const result = await continueTextConversation(newMessages);
    for await (const content of readStreamableValue(result)) {
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
      <div className="max-w-xl mx-auto mt-10 mb-24">
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
          <Button
            onClick={() => {
              setMessages([]);
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
            }}
          >
            Try again
          </Button>
        )}
      </div>
      {!messages.length && (
        <div className="w-full max-w-xl mx-auto">
          <TripPlannerForm formData={formData} setFormData={setFormData} />
          <Card className="my-4 p-2">
            <form onSubmit={handleSubmit}>
              <div className="flex">
                <Input
                  type="text"
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value);
                  }}
                  className="w-[95%] mr-2 border-0 ring-offset-0 focus-visible:ring-0 focus-visible:outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:border-none border-transparent focus:border-transparent focus-visible:ring-none"
                  placeholder={`Anything else?`}
                />
                <Button>
                  <IconArrowUp />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
