// Import necessary modules
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

// Instantiate Prisma client and initialize Express
const prisma = new PrismaClient();
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

/**
 * POST /nodes
 * Create a new node with an optional parentId (for building hierarchy)
 */
app.post("/nodes", async (req: Request, res: Response) => {
  const { name, parentId } = req.body;

  // Create node in the database
  const node = await prisma.node.create({
    data: { name, parentId },
  });

  res.json(node);
});

/**
 * POST /nodes/:id/properties
 * Add a new property (key-value pair) to an existing node
 */
app.post("/nodes/:id/properties", async (req: Request, res: Response) => {
  const nodeId = parseInt(req.params.id);

  // Define validation schema using zod
  const schema = z.object({
    key: z.string(),
    value: z.number().refine((val) => /^\d*\.?\d+$/.test(val.toString()), {
      message: "Value must be a decimal number",
    }),
  });

  // Validate incoming request body
  const parseResult = schema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.errors });
  }

  const { key, value } = parseResult.data;

  // Create property linked to the node
  const property = await prisma.property.create({
    data: { key, value, nodeId },
  });

  res.json(property);
});

/**
 * GET /subtree
 * Fetch a subtree starting from the node defined by a given path
 * Path format: /AlphaPC/Processing/CPU
 */
app.get("/subtree", async (req: Request, res: Response) => {
  const path = req.query.path as string;

  // Split path into individual node names
  const names = path.split("/").filter(Boolean);
  let current: any = null;

  // Traverse the node hierarchy to resolve the target node by path
  for (const name of names) {
    current = await prisma.node.findFirst({
      where: {
        name,
        parentId: current?.id || null,
      },
    });

    if (!current) return res.status(404).json({ error: "Path not found" });
  }

  // Fetch the full subtree (3-levels deep) including properties
  const node = await prisma.node.findUnique({
    where: { id: current.id },
    include: {
      properties: true,
      children: {
        include: {
          properties: true,
          children: {
            include: {
              properties: true,
              children: true, // 3rd-level only includes children without recursion
            },
          },
        },
      },
    },
  });

  res.json(node);
});

// Start the Express server
if (process.env.NODE_ENV !== "test") {
    app.listen(3000, () => console.log("Server running on http://localhost:3000"));
  }
  
  export default app;
  
