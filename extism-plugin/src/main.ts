/**
 * Main implementation for the Gmail Extism Plugin.
 * This file contains the core implementation that processes the requests from the host.
 */
import {
  CallToolRequest,
  CallToolResult,
  ListToolsResult,
  Tool
} from "./pdk";

import {
  handleListEmails,
  handleSearchEmails,
  handleSendEmail,
  handleModifyEmail
} from "./handlers/email";

/**
 * Implementation of the call function that routes requests to the appropriate handler.
 * @param request The request to process
 * @returns The result of processing the request
 */
export function callImpl(request: CallToolRequest): CallToolResult {
  try {
    // Save original methods for restoration later
    const originalInputString = Host.inputString;
    let outputContent: string = "";

    // Override Host.inputString and Host.outputString for the handlers
    Host.inputString = () => JSON.stringify(request.arguments);
    const originalOutputString = Host.outputString;
    Host.outputString = (content: string) => {
      outputContent = content;
      return content;
    };

    let result: number = 1;

    // Route the request to the appropriate handler based on the toolId
    switch (request.toolId) {
      case "list_emails":
        result = handleListEmails();
        break;
        
      case "search_emails":
        result = handleSearchEmails();
        break;
        
      case "send_email":
        result = handleSendEmail();
        break;
        
      case "modify_email":
        result = handleModifyEmail();
        break;
        
      default:
        // Restore original methods
        Host.inputString = originalInputString;
        Host.outputString = originalOutputString;
        return new CallToolResult(
          "error",
          null,
          `Unknown tool: ${request.toolId}`
        );
    }

    // Restore original methods
    Host.inputString = originalInputString;
    Host.outputString = originalOutputString;

    // Process result
    if (result === 0) {
      try {
        const parsedOutput = JSON.parse(outputContent);
        return new CallToolResult("success", parsedOutput, undefined);
      } catch (err) {
        return new CallToolResult(
          "success",
          { message: outputContent },
          undefined
        );
      }
    } else {
      try {
        const parsedError = JSON.parse(outputContent);
        return new CallToolResult(
          "error",
          null,
          parsedError.error || "Unknown error"
        );
      } catch (err) {
        return new CallToolResult("error", null, outputContent || "Unknown error");
      }
    }
  } catch (err) {
    return new CallToolResult(
      "error",
      null,
      `Error: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

/**
 * Implementation of the describe function that returns the list of available tools.
 * @returns A list of available tools
 */
export function describeImpl(): ListToolsResult {
  const tools: Tool[] = [
    new Tool(
      "list_emails",
      "List Emails",
      "Lists emails from the user's Gmail account",
      {
        accessToken: { type: "string", description: "OAuth2 access token" },
        maxResults: { type: "number", description: "Maximum number of emails to return", optional: true },
        query: { type: "string", description: "Query to filter emails", optional: true }
      }
    ),
    new Tool(
      "search_emails",
      "Search Emails",
      "Searches emails in the user's Gmail account based on a query",
      {
        accessToken: { type: "string", description: "OAuth2 access token" },
        maxResults: { type: "number", description: "Maximum number of emails to return", optional: true },
        query: { type: "string", description: "Query to filter emails" }
      }
    ),
    new Tool(
      "send_email",
      "Send Email",
      "Sends an email from the user's Gmail account",
      {
        accessToken: { type: "string", description: "OAuth2 access token" },
        to: { type: "string", description: "Email recipient" },
        subject: { type: "string", description: "Email subject" },
        body: { type: "string", description: "Email body (HTML)" },
        cc: { type: "string", description: "Carbon copy recipients", optional: true },
        bcc: { type: "string", description: "Blind carbon copy recipients", optional: true }
      }
    ),
    new Tool(
      "modify_email",
      "Modify Email",
      "Modifies an email by adding or removing labels",
      {
        accessToken: { type: "string", description: "OAuth2 access token" },
        id: { type: "string", description: "Email ID" },
        addLabels: { type: "array", description: "Labels to add", optional: true },
        removeLabels: { type: "array", description: "Labels to remove", optional: true }
      }
    )
  ];
  
  return new ListToolsResult(tools);
} 