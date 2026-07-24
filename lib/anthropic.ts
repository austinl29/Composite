import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | undefined;

export function getAnthropicClient() {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}
