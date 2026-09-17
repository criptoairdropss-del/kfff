import { DEFAULT_MODEL } from '@/ai/constants'
import { NextResponse } from 'next/server'
import { generateText, Output } from 'ai'
import { linesSchema, resultSchema } from '@/components/error-monitor/schemas'
import { getModelOptions } from '@/ai/gateway'
import prompt from './prompt.md'

export const maxDuration = 60

export async function POST(req: Request) {
  const body = await req.json()
  const parsedBody = linesSchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: `Invalid request` }, { status: 400 })
  }

  const result = await generateText({
    system: prompt,
    ...getModelOptions(DEFAULT_MODEL),
    messages: [{ role: 'user', content: JSON.stringify(parsedBody.data) }],
    output: Output.object({ schema: resultSchema }),
  })

  return NextResponse.json(result.output, {
    status: 200,
  })
}
