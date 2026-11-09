import "server-only";
import { MongoClient } from "mongodb";
import type { Data } from "./model";
/** Server-only adapter foundation. No public endpoint: production must authorise tenant access first. */
export async function connectWorkspaceRepository() {
  const uri = process.env.MONGODB_URI;
  if (!uri)
    throw new Error(
      "MongoDB is not configured. Browser demo remains available.",
    );
  const client = new MongoClient(uri);
  await client.connect();
  const collection = client
    .db(process.env.MONGODB_DB || "precious_memoirs")
    .collection<Data & { workspaceId: string }>("workspaces");
  return {
    async read(workspaceId: string) {
      return collection.findOne(
        { workspaceId },
        { projection: { _id: 0, workspaceId: 0 } },
      );
    },
    async save(workspaceId: string, data: Data, expectedRevision: number) {
      const result = await collection.replaceOne(
        { workspaceId, revision: expectedRevision },
        { ...data, workspaceId },
      );
      if (result.matchedCount !== 1)
        throw new Error("Workspace changed. Reload before saving.");
    },
    close: () => client.close(),
  };
}
