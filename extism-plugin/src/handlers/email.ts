/**
 * Email handling functions for interacting with the Gmail API.
 * Uses the Host and Http globals that are injected by the Extism runtime.
 */

// Do NOT import Host or Http at the top level—assume they are injected as globals.

/**
 * Parses JSON input from the Host and returns the arguments as an object.
 * On failure, outputs an error message and returns null.
 * @returns Parsed arguments object or null if parsing fails
 */
function getArgs(): any | null {
  try {
    const input = Host.inputString();
    const args = JSON.parse(input);
    return args;
  } catch (err) {
    Host.outputString(JSON.stringify({ error: "Invalid JSON input" }));
    return null;
  }
}
  
/**
 * Handles listing emails from the user's Gmail account.
 * Fetches a list of messages and their details based on the provided query parameters.
 * 
 * @returns 0 on success, 1 on error
 */
export function handleListEmails(): number {
  const args = getArgs();
  if (!args) return 1;

  const accessToken: string = args.accessToken;
  const maxResults: number = args.maxResults || 10;
  const query: string = args.query || "";

  // Construct URL for listing messages
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
  const emailDetails: any[] = [];

  // Fetch detailed information for each message
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
    // Extract relevant header information
    const headers = detail.payload?.headers;
    let subject = "";
    let from = "";
    let date = "";
    if (headers && Array.isArray(headers)) {
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        if (header.name === "Subject") subject = header.value;
        if (header.name === "From") from = header.value;
        if (header.name === "Date") date = header.value;
      }
    }
    emailDetails.push({ id: msg.id, subject, from, date });
  }

  Host.outputString(JSON.stringify(emailDetails, null, 2));
  return 0;
}

/**
 * Handles searching emails based on a specific query.
 * Nearly identical to handleListEmails, but requires a query parameter.
 * 
 * @returns 0 on success, 1 on error
 */
export function handleSearchEmails(): number {
  const args = getArgs();
  if (!args) return 1;

  const accessToken: string = args.accessToken;
  const maxResults: number = args.maxResults || 10;
  const query: string = args.query;
  if (!query) {
    Host.outputString(JSON.stringify({ error: "query parameter is required" }));
    return 1;
  }

  // Construct URL for searching messages with the provided query
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
  const emailDetails: any[] = [];

  // Fetch detailed information for each message
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
    // Extract relevant header information
    const headers = detail.payload?.headers;
    let subject = "";
    let from = "";
    let date = "";
    if (headers && Array.isArray(headers)) {
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        if (header.name === "Subject") subject = header.value;
        if (header.name === "From") from = header.value;
        if (header.name === "Date") date = header.value;
      }
    }
    emailDetails.push({ id: msg.id, subject, from, date });
  }

  Host.outputString(JSON.stringify(emailDetails, null, 2));
  return 0;
}

/**
 * Handles sending a new email through the Gmail API.
 * Constructs a properly formatted email (including MIME parts) and sends it.
 * 
 * @returns 0 on success, 1 on error
 */
export function handleSendEmail(): number {
  const args = getArgs();
  if (!args) return 1;

  const { accessToken, to, subject, body, cc, bcc } = args;
  
  // Construct email with proper MIME format
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

  // Base64 URL encode the message
  let encodedMessage = Buffer.from(message).toString("base64");
  encodedMessage = encodedMessage.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  // Send the email using the Gmail API
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

/**
 * Handles modifying labels on an existing email.
 * Can add and/or remove labels from a specific email message.
 * 
 * @returns 0 on success, 1 on error
 */
export function handleModifyEmail(): number {
  const args = getArgs();
  if (!args) return 1;

  const { accessToken, id, addLabels = [], removeLabels = [] } = args;
  
  // Call the Gmail API to modify the email's labels
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

/**
 * Handles creating a draft email through the Gmail API.
 * Constructs a properly formatted email (including MIME parts) and creates a draft.
 * 
 * @returns 0 on success, 1 on error
 */
export function handleCreateDraft(): number {
  const args = getArgs();
  if (!args) return 1;

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

  const draftUrl = "https://gmail.googleapis.com/gmail/v1/users/me/drafts";
  const response = Http.request({
    url: draftUrl,
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message: { raw: encodedMessage } })
  });

  if (response.status !== 200) {
    Host.outputString(JSON.stringify({ error: `Failed to create draft: ${response.body}` }));
    return 1;
  }

  let data;
  try {
    data = JSON.parse(response.body);
  } catch (err) {
    Host.outputString(JSON.stringify({ error: "Invalid response from Gmail" }));
    return 1;
  }

  Host.outputString(JSON.stringify({ message: "Draft created successfully", id: data.id }));
  return 0;
}
