export const appIds = [
  "finder",
  "soundboard",
  "internet-explorer",
  "chats",
  "textedit",
  "paint",
  "photo-booth",
  "minesweeper",
  "videos",
  "ipod",
  "synth",
  "pc",
  "terminal",
  "control-panels",
  "projects",
  "blog",
  "cinema-desk",
  "fun-facts",
] as const;

export type AppId = typeof appIds[number]; 