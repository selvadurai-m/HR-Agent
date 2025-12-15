// app/api/ai-feedback/route.jsx
import { NextResponse } from 'next/server';
import { FEEDBACK_PROMPT } from '@/services/Constants';
import { chatWithLLM } from '@/lib/llm';
import { getModelForTask } from '@/lib/getModel';
import { logger } from '@/lib/logger';

export async function POST(req) {
  try {
    const { conversation } = await req.json();

    // --- Build final prompt --------------------------------------------------
    const FINAL_PROMPT = FEEDBACK_PROMPT.replace(
      '{{conversation}}',
      JSON.stringify(conversation, null, 2)
    );

    logger.log('FINAL_PROMPT:', FINAL_PROMPT);

    // --- Automatically select vendor + model based on .env --------------------
    const { vendor, model } = getModelForTask('FEEDBACK');

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
    } catch (err) {
      logger.debug('JSON parse failed → returning raw text:', err);
      parsed = { raw: responseText };
    }

    // --- Return output -------------------------------------------------------
    return NextResponse.json({
      vendor,
      model,
      feedback: parsed,
    });
  } catch (err) {
    logger.error('AI Feedback Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
