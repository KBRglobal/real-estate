import { useState, memo } from "react";
import type { UIMessage } from "ai";
import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { useChatRuntime, AssistantChatTransport } from "@assistant-ui/react-ai-sdk";
import { MessageCircle, Send, X } from "lucide-react";

const transport = new AssistantChatTransport({
  api: "/api/chat",
});

const welcomeMessage: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [{ type: "text", text: "היי, כאן באנדי העוזר האישי שלך, איך אוכל לעזור לך?" }],
};

function ChatPanel() {
  const runtime = useChatRuntime({ transport, messages: [welcomeMessage] });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className="flex-1 flex flex-col overflow-hidden">
        <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto p-4 space-y-3">
          <ThreadPrimitive.Messages
            components={{
              UserMessage: UserMessage,
              AssistantMessage: AssistantMessage,
            }}
          />
        </ThreadPrimitive.Viewport>

        <div className="shrink-0 border-t border-white/10 p-3">
          <ComposerPrimitive.Root className="flex items-center gap-2">
            <ComposerPrimitive.Input
              placeholder="שאלו אותי הכל..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#2563EB]/50 resize-none"
            />
            <ComposerPrimitive.Send asChild>
              <button className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-[#0A0A0F] flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 disabled:opacity-40">
                <Send className="h-4 w-4" />
              </button>
            </ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </div>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  );
}

function ChatWidgetInner() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-[#0A0A0F] shadow-lg shadow-[#2563EB]/30 hover:scale-105 transition-transform"
        aria-label={isOpen ? "סגור צ'אט" : "פתח צ'אט"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-6 z-50 w-[360px] sm:w-[380px] h-[480px] sm:h-[520px] rounded-2xl border border-white/10 bg-[#0D0D14] shadow-2xl flex flex-col overflow-hidden"
          style={{ direction: "rtl" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0A0A0F] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#0A0A0F]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">PropLine Assistant</p>
                <p className="text-white/50 text-xs">מוכן לעזור לך</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat content */}
          <ChatPanel />
        </div>
      )}
    </>
  );
}

function UserMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-start">
      <div className="max-w-[80%] bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-2xl rounded-br-md px-4 py-2.5">
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => (
              <p className="text-white/90 text-sm leading-relaxed">{text}</p>
            ),
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
}

function AssistantMessage() {
  return (
    <MessagePrimitive.Root className="flex justify-end">
      <div className="max-w-[80%] bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-2.5">
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => (
              <p className="text-white/80 text-sm leading-relaxed">{text}</p>
            ),
          }}
        />
      </div>
    </MessagePrimitive.Root>
  );
}

export const ChatWidget = memo(ChatWidgetInner);
export default ChatWidget;
