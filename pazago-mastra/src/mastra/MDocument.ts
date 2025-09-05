class MDocument {
  content: string;
  metadata: Record<string, any>;

  constructor({ content, metadata }: { content: string; metadata: Record<string, any> }) {
    this.content = content;
    this.metadata = metadata;
  }
}

module.exports = MDocument;
