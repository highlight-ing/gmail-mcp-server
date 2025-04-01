import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export async function handleListEmails(args: any) {
  try {
    const { accessToken, maxResults = 10, query = '' } = args;

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }

    const data = await response.json();
    const messages = data.messages || [];
    
    const emailDetails = await Promise.all(
      messages.map(async (msg: any) => {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (!detailResponse.ok) {
          throw new Error(`Failed to fetch email details: ${detailResponse.statusText}`);
        }
        
        const detail = await detailResponse.json();
        
        const headers = detail.payload?.headers;
        const subject = headers?.find((h: any) => h.name === 'Subject')?.value || '';
        const from = headers?.find((h: any) => h.name === 'From')?.value || '';
        const date = headers?.find((h: any) => h.name === 'Date')?.value || '';

        return {
          id: msg.id,
          subject,
          from,
          date,
        };
      })
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(emailDetails, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error fetching emails: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleSearchEmails(args: any) {
  try {
    const { accessToken, maxResults = 10, query } = args;

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search emails: ${response.statusText}`);
    }

    const data = await response.json();
    const messages = data.messages || [];
    
    const emailDetails = await Promise.all(
      messages.map(async (msg: any) => {
        const detailResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (!detailResponse.ok) {
          throw new Error(`Failed to fetch email details: ${detailResponse.statusText}`);
        }
        
        const detail = await detailResponse.json();
        
        const headers = detail.payload?.headers;
        const subject = headers?.find((h: any) => h.name === 'Subject')?.value || '';
        const from = headers?.find((h: any) => h.name === 'From')?.value || '';
        const date = headers?.find((h: any) => h.name === 'Date')?.value || '';

        return {
          id: msg.id,
          subject,
          from,
          date,
        };
      })
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(emailDetails, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error searching emails: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleSendEmail(args: any) {
  try {
    const { accessToken, to, subject, body, cc, bcc } = args;

    // Create email content
    const message = [
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `To: ${to}`,
      cc ? `Cc: ${cc}` : '',
      bcc ? `Bcc: ${bcc}` : '',
      `Subject: ${subject}`,
      '',
      body,
    ].filter(Boolean).join('\r\n');

    // Encode the email
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send the email
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: `Email sent successfully. Message ID: ${data.id}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error sending email: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}

export async function handleModifyEmail(args: any) {
  try {
    const { accessToken, id, addLabels = [], removeLabels = [] } = args;

    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addLabelIds: addLabels,
          removeLabelIds: removeLabels,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to modify email: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: `Email modified successfully. Updated labels for message ID: ${data.id}`,
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error modifying email: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
} 