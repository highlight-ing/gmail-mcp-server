"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  call: () => call,
  describe: () => describe
});
module.exports = __toCommonJS(src_exports);

// src/pdk.ts
var CallToolRequest = class {
  constructor(toolId, arguments_) {
    this.toolId = toolId;
    this.arguments = arguments_;
  }
  static fromJson(json) {
    return new CallToolRequest(json.toolId, json.arguments || {});
  }
  static toJson(request) {
    return {
      toolId: request.toolId,
      arguments: request.arguments
    };
  }
};
var CallToolResult = class {
  constructor(state, result, error) {
    this.state = state;
    this.result = result;
    this.error = error;
  }
  static fromJson(json) {
    return new CallToolResult(json.state, json.result, json.error);
  }
  static toJson(result) {
    const json = {
      state: result.state,
      result: result.result
    };
    if (result.error) {
      json.error = result.error;
    }
    return json;
  }
};
var ListToolsResult = class {
  constructor(tools) {
    this.tools = tools;
  }
  static fromJson(json) {
    return new ListToolsResult(json.tools || []);
  }
  static toJson(result) {
    return {
      tools: result.tools
    };
  }
};

// src/handlers/email.ts
function getArgs() {
  try {
    const input = Host.inputString();
    const args = JSON.parse(input);
    return args;
  } catch (err) {
    Host.outputString(JSON.stringify({ error: "Invalid JSON input" }));
    return null;
  }
}
function handleListEmails() {
  const args = getArgs();
  if (!args)
    return 1;
  const accessToken = args.accessToken;
  const maxResults = args.maxResults || 10;
  const query = args.query || "";
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`;
  const response = Http.request({
    url: listUrl,
    method: "GET",
    headers: { "Authorization": `Bearer ${accessToken}` }
  });
  if (response.status !== 200) {
    Host.outputString(JSON.stringify({ error: `Failed to fetch emails: ${response.body}` }));
    return 1;
  }
  let data;
  try {
    data = JSON.parse(response.body);
  } catch (err) {
    Host.outputString(JSON.stringify({ error: "Invalid response from Gmail" }));
    return 1;
  }
  const messages = data.messages || [];
  const emailDetails = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`;
    const detailResponse = Http.request({
      url: detailUrl,
      method: "GET",
      headers: { "Authorization": `Bearer ${accessToken}` }
    });
    if (detailResponse.status !== 200) {
      Host.outputString(JSON.stringify({ error: `Failed to fetch email details: ${detailResponse.body}` }));
      return 1;
    }
    let detail;
    try {
      detail = JSON.parse(detailResponse.body);
    } catch (err) {
      continue;
    }
    const headers = detail.payload?.headers;
    let subject = "";
    let from = "";
    let date = "";
    if (headers && Array.isArray(headers)) {
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        if (header.name === "Subject")
          subject = header.value;
        if (header.name === "From")
          from = header.value;
        if (header.name === "Date")
          date = header.value;
      }
    }
    emailDetails.push({ id: msg.id, subject, from, date });
  }
  Host.outputString(JSON.stringify(emailDetails, null, 2));
  return 0;
}
function handleSearchEmails() {
  const args = getArgs();
  if (!args)
    return 1;
  const accessToken = args.accessToken;
  const maxResults = args.maxResults || 10;
  const query = args.query;
  if (!query) {
    Host.outputString(JSON.stringify({ error: "query parameter is required" }));
    return 1;
  }
  const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`;
  const response = Http.request({
    url: searchUrl,
    method: "GET",
    headers: { "Authorization": `Bearer ${accessToken}` }
  });
  if (response.status !== 200) {
    Host.outputString(JSON.stringify({ error: `Failed to search emails: ${response.body}` }));
    return 1;
  }
  let data;
  try {
    data = JSON.parse(response.body);
  } catch (err) {
    Host.outputString(JSON.stringify({ error: "Invalid response from Gmail" }));
    return 1;
  }
  const messages = data.messages || [];
  const emailDetails = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`;
    const detailResponse = Http.request({
      url: detailUrl,
      method: "GET",
      headers: { "Authorization": `Bearer ${accessToken}` }
    });
    if (detailResponse.status !== 200) {
      Host.outputString(JSON.stringify({ error: `Failed to fetch email details: ${detailResponse.body}` }));
      return 1;
    }
    let detail;
    try {
      detail = JSON.parse(detailResponse.body);
    } catch (err) {
      continue;
    }
    const headers = detail.payload?.headers;
    let subject = "";
    let from = "";
    let date = "";
    if (headers && Array.isArray(headers)) {
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        if (header.name === "Subject")
          subject = header.value;
        if (header.name === "From")
          from = header.value;
        if (header.name === "Date")
          date = header.value;
      }
    }
    emailDetails.push({ id: msg.id, subject, from, date });
  }
  Host.outputString(JSON.stringify(emailDetails, null, 2));
  return 0;
}
function handleSendEmail() {
  const args = getArgs();
  if (!args)
    return 1;
  const { accessToken, to, subject, body, cc, bcc } = args;
  const messageParts = [
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `To: ${to}`,
    cc ? `Cc: ${cc}` : "",
    bcc ? `Bcc: ${bcc}` : "",
    `Subject: ${subject}`,
    "",
    body
  ].filter(Boolean);
  const message = messageParts.join("\r\n");
  let encodedMessage = Buffer.from(message).toString("base64");
  encodedMessage = encodedMessage.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const sendUrl = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send";
  const response = Http.request({
    url: sendUrl,
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw: encodedMessage })
  });
  if (response.status !== 200) {
    Host.outputString(JSON.stringify({ error: `Failed to send email: ${response.body}` }));
    return 1;
  }
  let data;
  try {
    data = JSON.parse(response.body);
  } catch (err) {
    Host.outputString(JSON.stringify({ error: "Invalid response from Gmail" }));
    return 1;
  }
  Host.outputString(JSON.stringify({ message: "Email sent successfully", id: data.id }));
  return 0;
}
function handleModifyEmail() {
  const args = getArgs();
  if (!args)
    return 1;
  const { accessToken, id, addLabels = [], removeLabels = [] } = args;
  const modifyUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`;
  const response = Http.request({
    url: modifyUrl,
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      addLabelIds: addLabels,
      removeLabelIds: removeLabels
    })
  });
  if (response.status !== 200) {
    Host.outputString(JSON.stringify({ error: `Failed to modify email: ${response.body}` }));
    return 1;
  }
  let data;
  try {
    data = JSON.parse(response.body);
  } catch (err) {
    Host.outputString(JSON.stringify({ error: "Invalid response from Gmail" }));
    return 1;
  }
  Host.outputString(JSON.stringify({ message: "Email modified successfully", id: data.id }));
  return 0;
}

// src/main.ts
function callImpl(request) {
  try {
    const originalInputString = Host.inputString;
    let outputContent = "";
    Host.inputString = () => JSON.stringify(request.arguments);
    const originalOutputString = Host.outputString;
    Host.outputString = (content) => {
      outputContent = content;
      return true;
    };
    let result = 1;
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
        Host.inputString = originalInputString;
        Host.outputString = originalOutputString;
        return new CallToolResult(
          "error",
          null,
          `Unknown tool: ${request.toolId}`
        );
    }
    Host.inputString = originalInputString;
    Host.outputString = originalOutputString;
    if (result === 0) {
      try {
        const parsedOutput = JSON.parse(outputContent);
        return new CallToolResult("success", parsedOutput, void 0);
      } catch (err) {
        return new CallToolResult(
          "success",
          { message: outputContent },
          void 0
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
function describeImpl() {
  const tools = [
    {
      "type": "function",
      "function": {
        "name": "list_emails",
        "description": "Lists emails from the user's Gmail account",
        "parameters": {
          "type": "object",
          "properties": {
            "accessToken": {
              "type": "string",
              "description": "OAuth2 access token"
            },
            "maxResults": {
              "type": "integer",
              "description": "Maximum number of emails to return"
            },
            "query": {
              "type": "string",
              "description": "Query to filter emails"
            }
          },
          "required": ["accessToken"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "search_emails",
        "description": "Searches emails in the user's Gmail account based on a query",
        "parameters": {
          "type": "object",
          "properties": {
            "accessToken": {
              "type": "string",
              "description": "OAuth2 access token"
            },
            "maxResults": {
              "type": "integer",
              "description": "Maximum number of emails to return"
            },
            "query": {
              "type": "string",
              "description": "Query to filter emails"
            }
          },
          "required": ["accessToken", "query"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "send_email",
        "description": "Sends an email from the user's Gmail account",
        "parameters": {
          "type": "object",
          "properties": {
            "accessToken": {
              "type": "string",
              "description": "OAuth2 access token"
            },
            "to": {
              "type": "string",
              "description": "Email recipient"
            },
            "subject": {
              "type": "string",
              "description": "Email subject"
            },
            "body": {
              "type": "string",
              "description": "Email body (HTML)"
            },
            "cc": {
              "type": "string",
              "description": "Carbon copy recipients"
            },
            "bcc": {
              "type": "string",
              "description": "Blind carbon copy recipients"
            }
          },
          "required": ["accessToken", "to", "subject", "body"]
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "modify_email",
        "description": "Modifies an email by adding or removing labels",
        "parameters": {
          "type": "object",
          "properties": {
            "accessToken": {
              "type": "string",
              "description": "OAuth2 access token"
            },
            "id": {
              "type": "string",
              "description": "Email ID"
            },
            "addLabels": {
              "type": "array",
              "description": "Labels to add",
              "items": {
                "type": "string"
              }
            },
            "removeLabels": {
              "type": "array",
              "description": "Labels to remove",
              "items": {
                "type": "string"
              }
            }
          },
          "required": ["accessToken", "id"]
        }
      }
    }
  ];
  return new ListToolsResult(tools);
}

// src/index.ts
function call() {
  const untypedInput = JSON.parse(Host.inputString());
  const input = CallToolRequest.fromJson(untypedInput);
  const output = callImpl(input);
  const untypedOutput = CallToolResult.toJson(output);
  Host.outputString(JSON.stringify(untypedOutput));
  return 0;
}
function describe() {
  const output = describeImpl();
  const untypedOutput = ListToolsResult.toJson(output);
  Host.outputString(JSON.stringify(untypedOutput));
  return 0;
}
//# sourceMappingURL=index.js.map
