import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4-turbo"),
    messages,
    system: `You are a helpful eyewear consultant. Ask natural questions about:
    - Budget preferences
    - Style preferences (classic, bold, vintage, modern)
    - Face shape considerations
    - Color preferences
    - Lifestyle needs
    Keep responses conversational and brief.`,
  })

  return result.toDataStreamResponse()
}
