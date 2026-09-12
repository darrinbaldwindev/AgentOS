// BASIC-CHAT-001: minimal user-facing adapter over the existing governed task pipeline.
// This module does not create a second execution or persistence path.

import { randomUUID } from 'node:crypto';
import { createTaskPipeline } from './task-pipeline.mjs';

function requireText(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} is required`);
  return value.trim();
}

export function createBasicChatAdapter({ persistence, session, now = () => new Date().toISOString() }) {
  if (!persistence || typeof persistence.create !== 'function' || typeof persistence.list !== 'function') {
    throw new TypeError('persistence.create and persistence.list are required');
  }
  const pipeline = createTaskPipeline({ session });

  async function sendMessage({ threadId = 'basic:default', projectId = 'agentos-local', text, requirements = {} } = {}) {
    const message = requireText(text, 'text');
    const normalizedThreadId = requireText(threadId, 'threadId');
    const normalizedProjectId = requireText(projectId, 'projectId');
    const messageId = `chat:${randomUUID()}`;
    const missionId = `mission:${normalizedThreadId}`;
    const createdAt = now();

    await persistence.create('artifact', {
      id: messageId,
      artifactType: 'chat.message',
      threadId: normalizedThreadId,
      projectId: normalizedProjectId,
      missionId,
      role: 'user',
      text: message,
      createdAt,
    });

    let response;
    try {
      response = await pipeline.handle({
        missionId,
        message,
        requirements: {
          ...requirements,
          projectId: normalizedProjectId,
          interface: 'basic',
        },
      });
    } catch (error) {
      await persistence.create('event', {
        eventType: 'basic-chat.message.failed',
        missionId,
        threadId: normalizedThreadId,
        messageId,
        errorCode: error?.code ?? error?.message ?? 'BASIC_CHAT_SEND_FAILED',
        createdAt: now(),
      });
      throw error;
    }

    const assistantMessageId = `chat:${randomUUID()}`;
    const output = response?.result?.output ?? response?.output ?? response?.result ?? response;
    const assistantText = typeof output === 'string' ? output : JSON.stringify(output ?? null);

    await persistence.create('artifact', {
      id: assistantMessageId,
      artifactType: 'chat.message',
      threadId: normalizedThreadId,
      projectId: normalizedProjectId,
      missionId,
      role: 'agentos',
      text: assistantText,
      runId: response?.result?.runId ?? null,
      createdAt: now(),
    });
    await persistence.create('event', {
      eventType: 'basic-chat.turn.completed',
      missionId,
      threadId: normalizedThreadId,
      userMessageId: messageId,
      assistantMessageId,
      runId: response?.result?.runId ?? null,
      createdAt: now(),
    });

    return Object.freeze({
      threadId: normalizedThreadId,
      projectId: normalizedProjectId,
      missionId,
      messageId,
      assistantMessageId,
      text: assistantText,
      status: 'COMPLETED',
      runId: response?.result?.runId ?? null,
      response,
    });
  }

  async function history({ threadId = 'basic:default' } = {}) {
    const normalizedThreadId = requireText(threadId, 'threadId');
    const artifacts = await persistence.list('artifact');
    return artifacts
      .filter((artifact) => artifact.artifactType === 'chat.message' && artifact.threadId === normalizedThreadId)
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  }

  return Object.freeze({ sendMessage, history });
}
