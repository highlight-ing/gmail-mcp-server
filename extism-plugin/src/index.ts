/**
 * Main entry point for the Gmail MCP Extism Plugin.
 * This file exports WebAssembly compatible functions that serve as entry points
 * for interacting with the Gmail API through the Extism runtime.
 */
import {
  handleListEmails,
  handleSearchEmails,
  handleSendEmail,
  handleModifyEmail,
} from "./handlers/email";

/**
 * Lists emails from the user's Gmail account.
 * Takes JSON input containing accessToken, maxResults (optional), and query (optional).
 * @returns 0 on success, 1 on error
 */
export function list_emails(): number {
  return handleListEmails();
}

/**
 * Searches emails in the user's Gmail account based on a query.
 * Takes JSON input containing accessToken, maxResults (optional), and query.
 * @returns 0 on success, 1 on error
 */
export function search_emails(): number {
  return handleSearchEmails();
}

/**
 * Sends an email from the user's Gmail account.
 * Takes JSON input containing accessToken, to, subject, body, cc (optional), and bcc (optional).
 * @returns 0 on success, 1 on error
 */
export function send_email(): number {
  return handleSendEmail();
}

/**
 * Modifies an email by adding or removing labels.
 * Takes JSON input containing accessToken, id, addLabels (optional), and removeLabels (optional).
 * @returns 0 on success, 1 on error
 */
export function modify_email(): number {
  return handleModifyEmail();
}
