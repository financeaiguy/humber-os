export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 9);
  const id = `${timestamp}${randomPart}`;
  
  return prefix ? `${prefix}_${id}` : id;
}

export function generateCandidateId(): string {
  return generateId('cand');
}

export function generateTimesheetId(): string {
  return generateId('ts');
}

export function generateLogId(): string {
  return generateId('log');
}

export function generateDocumentId(): string {
  return generateId('doc');
}

export function generateChatId(): string {
  return generateId('chat');
}

export function generateSessionId(): string {
  return generateId('session');
}