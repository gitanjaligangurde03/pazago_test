declare module "../mastra" {
  export class MDocument {
    content: string;
    metadata: Record<string, any>;

    constructor(params: { content: string; metadata: Record<string, any> });
  }
}
