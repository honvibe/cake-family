import { ChatRequest, ChatResponse } from "./types";
import { getIdentity } from "./identity";
import { getHistory, appendHistory } from "./history";
import { buildSystemPrompt } from "./system-prompt";
import { toolDeclarations, executeTool, getScheduleContext } from "./tools";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// ลำดับ: Groq Scout (primary เร็ว+tools) → GLM (fallback+tools) → Groq 70B (fallback no tools)
const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const GLM_MODEL = "z-ai/glm-4.5-air:free";
const GROQ_FALLBACK = "llama-3.3-70b-versatile";
const MAX_TOOL_ROUNDS = 3;

// คำที่บ่งบอกว่าถามเรื่องตาราง → ต้องใช้ tools
const SCHEDULE_KEYWORDS = [
  "ตาราง", "รับส่ง", "ใครรับ", "ใครส่ง", "ใครขับ", "คนขับ",
  "เช้า", "เย็น", "morning", "evening",
  "น้ำมัน", "เติมน้ำมัน", "ไมล์", "เลขไมล์",
  "กิจกรรม", "นัด", "event",
  "เปลี่ยนคนขับ", "เปลี่ยนตาราง", "สลับ",
  "วันนี้มีอะไร", "วันนี้ใคร", "พรุ่งนี้ใคร",
  "สัปดาห์", "อาทิตย์นี้",
  "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์",
];

function needsSchedule(text: string): boolean {
  const lower = text.toLowerCase();
  return SCHEDULE_KEYWORDS.some(kw => lower.includes(kw));
}

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

interface LLMResult {
  content: string | null;
  tool_calls?: ToolCall[];
  rateLimited?: boolean;
  error?: boolean;
}

// Generic OpenAI-compatible API call
async function callLLM(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  useTools: boolean,
): Promise<LLMResult> {
  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: 1024,
    temperature: 0.7,
  };

  if (useTools) {
    body.tools = toolDeclarations;
    body.tool_choice = "auto";
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  if (url.includes("openrouter")) {
    headers["HTTP-Referer"] = "https://cake-family.vercel.app";
    headers["X-Title"] = "Cake Family Bot";
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (res.status === 429) {
    console.warn(`[LLM] 429 rate limited: ${model}`);
    return { content: null, rateLimited: true };
  }

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[LLM] Error ${res.status} on ${model}:`, errText);
    return { content: null, error: true };
  }

  const data = await res.json();
  const choice = data.choices?.[0]?.message;
  return {
    content: choice?.content || null,
    tool_calls: choice?.tool_calls || undefined,
  };
}

// ลบ function call leak ออกจากข้อความ
function cleanResponse(text: string): string {
  return text
    .replace(/<function=[^>]*>.*?<\/function>/g, "")
    .replace(/<function=[^>]*\/>/g, "")
    .replace(/<\/?function[^>]*>/g, "")
    .replace(/<\|.*?\|>/g, "")
    .trim();
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  if (!openrouterKey && !groqKey) {
    console.error("[Chat Engine] No API keys set");
    return { text: "ระบบยังไม่ได้ตั้งค่า API key ค่ะ" };
  }

  const identity = await getIdentity(req.userId);
  const userName = identity?.name || null;
  const history = await getHistory(req.userId);

  const wantsSchedule = needsSchedule(req.text);
  console.log(`[Chat Engine] schedule=${wantsSchedule}, text="${req.text.slice(0, 30)}"`);

  const baseSystemPrompt = buildSystemPrompt(userName);
  const messages: ChatMessage[] = [
    { role: "system", content: baseSystemPrompt },
  ];

  for (const msg of history) {
    messages.push({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.text,
    });
  }
  messages.push({ role: "user", content: req.text });

  try {
    // === ลำดับ 1: Groq Llama 4 Scout (เร็วมาก ~0.3s + มี tools) ===
    if (groqKey) {
      console.log("[Chat Engine] Trying Groq:", GROQ_MODEL);
      const result = await callLLM(
        GROQ_API_URL, groqKey, GROQ_MODEL, messages, wantsSchedule
      );

      if (!result.rateLimited && !result.error) {
        if (wantsSchedule && result.tool_calls?.length) {
          return await handleToolCalls(
            result, messages, GROQ_API_URL, groqKey, GROQ_MODEL, req
          );
        }

        const replyText = cleanResponse(result.content || "ไม่สามารถตอบได้ค่ะ");
        await appendHistory(req.userId, req.text, replyText);
        return { text: replyText };
      }

      console.log("[Chat Engine] Groq primary failed, trying GLM...");
    }

    // === ลำดับ 2: GLM 4.5 Air via OpenRouter (มี tools, ช้ากว่า ~8s) ===
    if (openrouterKey) {
      console.log("[Chat Engine] Trying GLM:", GLM_MODEL);
      const result = await callLLM(
        OPENROUTER_API_URL, openrouterKey, GLM_MODEL, messages, wantsSchedule
      );

      if (!result.rateLimited && !result.error) {
        if (wantsSchedule && result.tool_calls?.length) {
          return await handleToolCalls(
            result, messages, OPENROUTER_API_URL, openrouterKey, GLM_MODEL, req
          );
        }

        if (result.content) {
          const replyText = cleanResponse(result.content);
          await appendHistory(req.userId, req.text, replyText);
          return { text: replyText };
        }
      }

      console.log("[Chat Engine] GLM failed too, trying last fallback...");
    }

    // === ลำดับ 3: Groq Llama 3.3 70B (ไม่มี tools, inject context) ===
    if (groqKey) {
      console.log("[Chat Engine] Trying Groq fallback:", GROQ_FALLBACK);
      const fallbackMessages = [...messages];
      if (wantsSchedule) {
        const scheduleCtx = await getScheduleContext();
        fallbackMessages[0] = {
          role: "system",
          content: `${baseSystemPrompt}\n\n${scheduleCtx}\n\nตอบจากข้อมูลข้างบน ห้ามแต่งเอง ถ้าไม่มีข้อมูลให้บอกว่าไม่มี`,
        };
      }

      const fallback = await callLLM(
        GROQ_API_URL, groqKey, GROQ_FALLBACK, fallbackMessages, false
      );

      if (!fallback.rateLimited && !fallback.error && fallback.content) {
        const replyText = cleanResponse(fallback.content);
        await appendHistory(req.userId, req.text, replyText);
        return { text: replyText };
      }
    }

    return { text: "ขอโทษค่ะพี่ ตอนนี้ระบบคนใช้เยอะ\n\nลองใหม่อีกสักครู่นะคะ" };
  } catch (error: unknown) {
    console.error("[Chat Engine] Error:", error);
    return { text: "ขอโทษค่ะพี่ เกิดข้อผิดพลาด\n\nลองใหม่อีกทีนะคะ" };
  }
}

// จัดการ tool calling loop
async function handleToolCalls(
  initialResult: LLMResult,
  messages: ChatMessage[],
  apiUrl: string,
  apiKey: string,
  model: string,
  req: ChatRequest,
): Promise<ChatResponse> {
  let result = initialResult;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    if (!result.tool_calls || result.tool_calls.length === 0) break;

    messages.push({
      role: "assistant",
      content: result.content,
      tool_calls: result.tool_calls,
    });

    for (const tc of result.tool_calls) {
      const args = JSON.parse(tc.function.arguments || "{}");
      console.log(`[Chat Engine] Tool: ${tc.function.name}`, args);
      const toolResult = await executeTool(tc.function.name, args);

      messages.push({
        role: "tool",
        content: toolResult,
        tool_call_id: tc.id,
      });
    }

    const next = await callLLM(apiUrl, apiKey, model, messages, true);
    if (next.rateLimited || next.error) break;
    result = next;
  }

  const rawText = result.content || "ไม่สามารถตอบได้ค่ะ ลองใหม่นะคะ";
  const replyText = cleanResponse(rawText);
  await appendHistory(req.userId, req.text, replyText);
  return { text: replyText };
}
