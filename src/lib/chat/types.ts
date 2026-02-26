// Shared types สำหรับ Gemini chatbot

export type Driver = "Hon" | "Jay" | "JH" | "";

export interface CalEvent {
  id: string;
  driver: "Hon" | "Jay" | "JH";
  startDate?: string;
  endDate?: string;
  time: string;
  endTime?: string;
  duration?: number;
  detail: string;
}

export interface ScheduleEntry {
  morning: Driver;
  evening: Driver;
  fuel: string;
  mileage: string;
  remarks: Partial<Record<"Hon" | "Jay" | "JH", string>>;
  events?: CalEvent[];
  emojis?: string[];
}

export type ScheduleData = Record<string, ScheduleEntry>; // key = "YYYY-MM-DD"

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export interface UserIdentity {
  name: "Hon" | "Jay" | "JH";
  registeredAt: string; // ISO date
}

export interface ChatRequest {
  userId: string;
  text: string;
  sourceType: "user" | "group" | "room";
  displayName?: string;
}

export interface ChatResponse {
  text: string;
}
