/**
 * Types for the Plugin Development Kit (PDK)
 * These types define the interface between the Extism runtime and the plugin.
 */

/**
 * Request to call a specific tool
 */
export class CallToolRequest {
  toolId: string;
  arguments: Record<string, any>;
  
  constructor(toolId: string, arguments_: Record<string, any>) {
    this.toolId = toolId;
    this.arguments = arguments_;
  }
  
  static fromJson(json: any): CallToolRequest {
    return new CallToolRequest(json.toolId, json.arguments || {});
  }
  
  static toJson(request: CallToolRequest): any {
    return {
      toolId: request.toolId,
      arguments: request.arguments
    };
  }
}

/**
 * Result of calling a tool
 */
export class CallToolResult {
  state: string;
  result: any;
  error?: string;
  
  constructor(state: string, result: any, error?: string) {
    this.state = state;
    this.result = result;
    this.error = error;
  }
  
  static fromJson(json: any): CallToolResult {
    return new CallToolResult(json.state, json.result, json.error);
  }
  
  static toJson(result: CallToolResult): any {
    const json: any = {
      state: result.state,
      result: result.result
    };
    if (result.error) {
      json.error = result.error;
    }
    return json;
  }
}

/**
 * Tool description
 */
export class Tool {
  id: string;
  label: string;
  description: string;
  parameters: Record<string, any>;
  
  constructor(id: string, label: string, description: string, parameters: Record<string, any>) {
    this.id = id;
    this.label = label;
    this.description = description;
    this.parameters = parameters;
  }
  
  static fromJson(json: any): Tool {
    return new Tool(
      json.id,
      json.label,
      json.description,
      json.parameters || {}
    );
  }
  
  static toJson(tool: Tool): any {
    return {
      id: tool.id,
      label: tool.label,
      description: tool.description,
      parameters: tool.parameters
    };
  }
}

/**
 * Result of listing available tools
 */
export class ListToolsResult {
  tools: any[];
  
  constructor(tools: any[]) {
    this.tools = tools;
  }
  
  static fromJson(json: any): ListToolsResult {
    return new ListToolsResult(json.tools || []);
  }
  
  static toJson(result: ListToolsResult): any {
    return {
      tools: result.tools
    };
  }
} 