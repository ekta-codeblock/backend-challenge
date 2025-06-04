// Import PrismaClient from Prisma
import { PrismaClient } from '@prisma/client';

// Instantiate the Prisma client
const prisma = new PrismaClient();

// Define the main seed function
async function main() {
  // Create the root node "AlphaPC"
  const alphaPC = await prisma.node.create({ data: { name: "AlphaPC" } });

  // Add properties to AlphaPC
  await prisma.property.createMany({
    data: [
      { key: "Height", value: 450.00, nodeId: alphaPC.id },
      { key: "Width", value: 180.00, nodeId: alphaPC.id },
    ],
  });

  // Create child node "Processing" under "AlphaPC"
  const processing = await prisma.node.create({
    data: { name: "Processing", parentId: alphaPC.id },
  });

  // Create "CPU" node under "Processing"
  const cpu = await prisma.node.create({
    data: { name: "CPU", parentId: processing.id },
  });

  // Add properties to "CPU"
  await prisma.property.createMany({
    data: [
      { key: "Cores", value: 4, nodeId: cpu.id },
      { key: "Power", value: 2.41, nodeId: cpu.id },
    ],
  });

  // Create "Graphics" node under "Processing"
  const graphics = await prisma.node.create({
    data: { name: "Graphics", parentId: processing.id },
  });

  // Add property to "Graphics"
  await prisma.property.create({ data: { key: "RAM", value: 4000.00, nodeId: graphics.id } });

  // Add additional properties to "AlphaPC"
  await prisma.property.create({ data: { key: "Ports", value: 8.00, nodeId: alphaPC.id } });
  await prisma.property.create({ data: { key: "RAM", value: 32000.00, nodeId: alphaPC.id } });

  // Create "Storage" node under "AlphaPC"
  const storage = await prisma.node.create({
    data: { name: "Storage", parentId: alphaPC.id },
  });

  // Create "SSD" and "HDD" under "Storage"
  const ssd = await prisma.node.create({ data: { name: "SSD", parentId: storage.id } });
  const hdd = await prisma.node.create({ data: { name: "HDD", parentId: storage.id } });

  // Add properties to "SSD" and "HDD"
  await prisma.property.createMany({
    data: [
      { key: "Capacity", value: 1024.00, nodeId: ssd.id },
      { key: "WriteSpeed", value: 250.00, nodeId: ssd.id },
      { key: "Capacity", value: 5120.00, nodeId: hdd.id },
      { key: "WriteSpeed", value: 1.724752, nodeId: hdd.id },
    ],
  });
}

// Run the seed function and disconnect Prisma afterward
main().finally(() => prisma.$disconnect());
