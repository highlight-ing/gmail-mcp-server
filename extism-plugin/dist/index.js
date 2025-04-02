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
  list_emails: () => list_emails,
  modify_email: () => modify_email,
  search_emails: () => search_emails,
  send_email: () => send_email
});
module.exports = __toCommonJS(src_exports);

// src/handlers/email.ts
function getArgs() {
  const input = Host.inputString();
  try {
    return JSON.parse(input);
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

// src/index.ts
function list_emails() {
  return handleListEmails();
}
function search_emails() {
  return handleSearchEmails();
}
function send_email() {
  return handleSendEmail();
}
function modify_email() {
  return handleModifyEmail();
}
//# sourceMappingURL=index.js.map
