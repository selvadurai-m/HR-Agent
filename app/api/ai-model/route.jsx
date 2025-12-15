// app/api/ai-model/route.jsx
import { NextResponse } from 'next/server';
import { QUESTIONS_PROMPT } from '@/services/Constants';
import { chatWithLLM } from '@/lib/llm';
import { getModelForTask } from '@/lib/getModel';
import { logger } from '@/lib/logger';

export async function POST(req) {
  try {
    const { job_position, job_description, duration, type } = await req.json();

    // --- Build final prompt --------------------------------------------------
    const FINAL_PROMPT = QUESTIONS_PROMPT.replace(
      '{{job_position}}',
      job_position
    )
      .replace('{{job_description}}', job_description)
      .replace('{{duration}}', duration)
      .replace('{{type}}', type);

    logger.log('FINAL_PROMPT:', FINAL_PROMPT);

    // --- Automatically select vendor + model based on .env --------------------
    const { vendor, model } = getModelForTask('QUESTION_GENERATION');

    logger.log('Using Vendor:', vendor);
    logger.log('Using Model:', model);

    // --- Build LLM request ---------------------------------------------------
    const llmRequest = {
      model,
      messages: [
        {
          role: 'user',
          content: FINAL_PROMPT,
        },
      ],
    };

    // --- Call unified LLM wrapper --------------------------------------------
    const responseText = await chatWithLLM(vendor, llmRequest);

    logger.log('Raw LLM Response:', responseText);

    // --- Safe JSON parsing ---------------------------------------------------
    let parsed = null;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        try {
          parsed = JSON.parse(jsonMatch[1].trim());
          logger.log('Parsed JSON from code block');
        } catch {
          logger.debug('Failed to parse JSON from code block');
        }
      }

      // Try to find JSON object/array in the response
      if (!parsed) {
        const objectMatch = responseText.match(/(\{[\s\S]*\})/);
        const arrayMatch = responseText.match(/(\[[\s\S]*\])/);
        const jsonCandidate = objectMatch?.[1] || arrayMatch?.[1];

        if (jsonCandidate) {
          try {
            parsed = JSON.parse(jsonCandidate);
            logger.log('Parsed JSON from embedded object/array');
          } catch {
            logger.debug('Failed to parse embedded JSON');
          }
        }
      }

      // If still not parsed, return raw text
      if (!parsed) {
        logger.debug('JSON parse failed → returning raw text');
        parsed = { raw: responseText };
      }
    }

    // --- Return output -------------------------------------------------------
    return NextResponse.json({
      vendor,
      model,
      questions: parsed,
    });
  } catch (err) {
    logger.error('Router Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
