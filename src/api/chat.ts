/**
 * POST /api/chat 的 SSE 流式接口。
 *
 * 这一层不依赖 Vue，是纯 TS：传入 AbortSignal 与三个回调即可。
 * 拆出来的主要目的是可测——parseSSEBlock 可以直接喂字符串做单测。
 */

import { apiUrl, readErrorDetail } from "./client";

/** 一个解析完成的 SSE 事件块。 */
export interface SSEEvent {
  /** event: 行的值，缺省为 "message"。 */
  event: string;
  /** data: 行拼接后 JSON.parse 的结果；非 JSON 时包装成 { text }。 */
  data: Record<string, unknown>;
}

/**
 * 解析一个以空行结束的 SSE 事件块。
 * 没有 data: 行时返回 null（例如后端的 ": connected" 心跳注释）。
 */
export function parseSSEBlock(block: string): SSEEvent | null {
  let event = "message";
  const dataLines: string[] = [];

  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (!dataLines.length) {
    return null;
  }

  const raw = dataLines.join("\n");

  try {
    return { event, data: JSON.parse(raw) as Record<string, unknown> };
  } catch {
    // 后端如果发了纯文本负载，按文本增量处理。
    return { event, data: { text: raw } };
  }
}

export interface ChatStreamOptions {
  message: string;
  /** 用于「停止生成」与组件卸载时中断请求。 */
  signal?: AbortSignal;
  /** 收到一段文本增量。 */
  onDelta: (text: string) => void;
  /** 收到 done 事件。 */
  onDone: () => void;
  /** 收到 error 事件，或连接本身失败。 */
  onError: (message: string) => void;
}

/**
 * 向 /api/chat 发送一条消息并消费 SSE 流。
 *
 * 中断方式：abort 传入的 signal，fetch 与 reader.read() 都会以
 * AbortError 拒绝，由调用方决定如何呈现。
 */
export async function streamChat({
  message,
  signal,
  onDelta,
  onDone,
  onError,
}: ChatStreamOptions): Promise<void> {
  const response = await fetch(apiUrl("/api/chat"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({ message }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await readErrorDetail(response));
  }

  if (!response.body) {
    throw new Error("没有收到流式响应。");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  function dispatch(block: string) {
    const parsed = parseSSEBlock(block);

    if (!parsed) {
      return;
    }

    if (parsed.event === "message" && typeof parsed.data.text === "string") {
      onDelta(parsed.data.text);
    } else if (parsed.event === "done") {
      onDone();
    } else if (parsed.event === "error") {
      onError(String(parsed.data.error || "发生未知错误"));
    }
  }

  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // 统一换行符，之后用空行切分事件。
      buffer = buffer.replace(/\r\n/g, "\n");

      let boundary = buffer.indexOf("\n\n");

      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        if (block.trim()) {
          dispatch(block);
        }

        boundary = buffer.indexOf("\n\n");
      }
    }

    // 冲刷 decoder，处理最后一段没有换行结尾的数据。
    buffer += decoder.decode();

    if (buffer.trim()) {
      dispatch(buffer);
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // 流已经关闭时 releaseLock 可能抛错，忽略。
    }
  }
}
