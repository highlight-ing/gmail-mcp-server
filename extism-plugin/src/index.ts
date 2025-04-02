/**
 * Main entry point for the Gmail MCP Extism Plugin.
 * This file exports WebAssembly compatible functions that serve as entry points
 * for interacting with the Gmail API through the Extism runtime.
 */
import * as main from "./main";

import { CallToolRequest, CallToolResult, ListToolsResult } from "./pdk";

export function call(): number {
  const untypedInput = JSON.parse(Host.inputString());
  const input = CallToolRequest.fromJson(untypedInput);

  const output = main.callImpl(input);

  const untypedOutput = CallToolResult.toJson(output);
  Host.outputString(JSON.stringify(untypedOutput));

  return 0;
}

export function describe(): number {
  const output = main.describeImpl();

  const untypedOutput = ListToolsResult.toJson(output);
  Host.outputString(JSON.stringify(untypedOutput));

  return 0;
}
