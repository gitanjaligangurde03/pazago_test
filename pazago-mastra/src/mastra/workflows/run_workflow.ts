const { ingestDocuments } = require("./document_ingestion");
const { setupVectorDatabase } = require("./vector_database_setup");
const dotenv = require("dotenv");
dotenv.config();

(async () => {
  try {
    const chunks = await ingestDocuments();
    await setupVectorDatabase(chunks);
    console.log("Workflow completed successfully.");
  } catch (error) {
    console.error("Error in workflow:", error);
  }
})();
