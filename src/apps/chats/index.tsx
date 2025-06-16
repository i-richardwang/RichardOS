import { BaseApp } from "../base/types";
import { ChatsAppComponent } from "./components/ChatsAppComponent";

export const helpItems = [
  {
    icon: "💬",
    title: "Chat with Richard",
    description:
      "Type your message to chat with Richard, generate code, or help with Richard OS.",
  },
  /* HIDDEN: Chat room functionality disabled - uncomment to restore
  {
    icon: "#️⃣",
    title: "Join Chat Rooms",
    description:
      "Connect with netizens in public chat rooms.",
  },
  */
  {
    icon: "🎤",
    title: "Push to Talk",
    description:
      "Hold Space or tap the microphone button to record and send voice messages.",
  },
  {
    icon: "📝",
    title: "Control TextEdit",
    description:
      "Ask Richard to read, insert, replace, or delete lines in your open TextEdit document.",
  },
  {
    icon: "🚀",
    title: "Control Apps",
    description:
      "Ask Richard to launch or close other applications like Internet Explorer or Video Player.",
  },
  {
    icon: "💾",
    title: "Save Transcript",
    description:
      "Save your current chat conversation with Richard as a Markdown file.",
  },
];

export const appMetadata = {
  name: "Chats",
  version: "1.0",
  creator: {
    name: "Richard Wang",
    url: "https://github.com/i-richardwang",
  },
  github: "https://github.com/i-richardwang/RichardOS",
  icon: "/icons/question.png",
};

export const ChatsApp: BaseApp = {
  id: "chats",
  name: "Chats",
  icon: { type: "image", src: appMetadata.icon },
  description: "Chat with Richard, your personal AI assistant",
  component: ChatsAppComponent,
  helpItems,
  metadata: appMetadata,
};
