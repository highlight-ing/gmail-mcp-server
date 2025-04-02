/**
 * Global type definitions for the Extism Plugin.
 * These types represent objects that are injected into the runtime environment
 * by the Extism host when the WebAssembly plugin is loaded.
 */

/**
 * Host provides methods for interacting with the plugin's input and output.
 * The Extism runtime injects this global to allow reading input data and writing output data.
 */
declare var Host: {
    /**
     * Reads input data provided to the plugin as a string.
     * @returns The input data as a string
     */
    inputString: () => string;
    
    /**
     * Writes string data as the plugin's output.
     * @param s The string data to write as output
     */
    outputString: (s: string) => void;
  };
  
/**
 * Http provides methods for making HTTP requests from within the plugin.
 * The Extism runtime injects this global to allow plugins to communicate with external services.
 */
declare var Http: {
    /**
     * Makes an HTTP request to the specified URL.
     * @param options Request options including url, method, headers, and body
     * @returns Response object with status code and body
     */
    request(options: {
      url: string;
      method: string;
      headers?: { [key: string]: string };
      body?: string;
    }): { status: number; body: string };
  };
  