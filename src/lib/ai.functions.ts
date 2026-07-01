import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3-flash-preview";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const gateway = createLovableAiGatewayProvider(key);
  return gateway(MODEL);
}

const EmailInput = z.object({
  intent: z.string().min(1),
  tone: z.enum(["formal", "friendly", "persuasive"]),
  sender: z.string().optional(),
});
export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const toneMap = {
      formal: "formal and professional",
      friendly: "friendly and collaborative",
      persuasive: "persuasive and strategic",
    };
    const { text } = await generateText({
      model: getModel(),
      system: `You are an expert workplace email writer. Compose complete, ready-to-send emails in a ${toneMap[data.tone]} tone. Include a subject line prefixed with "Subject:" and a clear greeting and sign-off. Keep it concise and clear.`,
      prompt: `Compose an email based on this intent:\n\n${data.intent}${data.sender ? `\n\nSign the email as: ${data.sender}` : ""}`,
    });
    return { text };
  });

const MeetingInput = z.object({ transcript: z.string().min(1) });
export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system: `You analyze meeting transcripts. Return markdown with exactly two sections:\n\n## Executive Summary\nA tight 3-5 sentence overview.\n\n## Action Targets & Ownership\nA bullet list. For each item use: **Owner** — Action (Due: date or TBD).`,
      prompt: data.transcript,
    });
    return { text };
  });

const TasksInput = z.object({
  backlog: z.string().min(1),
  horizon: z.enum(["daily", "weekly"]),
});
export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TasksInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system: `You are a prioritization engine. Take a raw task backlog and produce an optimized ${data.horizon === "daily" ? "single-day" : "weekly (Mon-Fri)"} execution plan in markdown. Group by ${data.horizon === "daily" ? "time block (Morning / Afternoon / Evening)" : "weekday"}. For each task include priority (P1/P2/P3), estimated effort, and a one-line rationale. End with a "Deferred / Backlog" section for anything cut.`,
      prompt: `Raw backlog:\n${data.backlog}`,
    });
    return { text };
  });

const ResearchInput = z.object({
  topic: z.string().min(1),
  depth: z.enum(["brief", "deep"]),
});
export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system: `You are a research analyst. Produce a ${data.depth === "brief" ? "high-level executive brief (300-400 words)" : "granular deep dive with structural analysis (700-1000 words, use subheadings)"} in markdown on the requested topic. End with a "## Strategic Vector Recommendations" section containing 3-5 concrete next-step recommendations as a bullet list.`,
      prompt: data.topic,
    });
    return { text };
  });
