"use server";

import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { createStreamableUI } from "ai/rsc";
import { ReactNode } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
  display?: ReactNode;
}

// Streaming Chat
export async function continueTextConversation(messages: CoreMessage[]) {
  const result = await streamText({
    model: openai("gpt-3.5-turbo"),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

const SYSTEM_PROMPT = `
Create a [duration]-day family-friendly itinerary for [destination] with these specifications:
	- Budget level: [budget/night for accommodations]
  - Children's ages: [ages]
	- Must-have activities: [preferences]
	- Mobility requirements: [any limitations]
	- Preferred pace: [relaxed/moderate/active]
	- Season of travel: [season]

Include daily schedules with kid-friendly restaurants, rest breaks, and backup indoor activities for weather changes.

Include emojis for visual appeal and use a friendly, conversational tone.
`;

// Gen UIs
export async function continueConversation(history: Message[]) {
  const stream = createStreamableUI();

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: SYSTEM_PROMPT,
    messages: history,
  });

  return {
    messages: [
      ...history,
      {
        role: "assistant" as const,
        content: text,
        display: stream.value,
      },
    ],
  };
}

// Utils
export async function checkAIAvailability() {
  const envVarExists = !!process.env.OPENAI_API_KEY;
  return envVarExists;
}
