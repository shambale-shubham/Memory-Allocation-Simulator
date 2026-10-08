import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ======================================================
// ALLOCATION LOGIC — ONE PROCESS PER BLOCK
// ======================================================
// Each block can only accept ONE process.
// Once allocated, the block is LOCKED.
// The leftover space becomes INTERNAL FRAGMENTATION (wasted).
// ======================================================

function allocate(blocks, processes, algorithm) {
  const originalBlocks = [...blocks];

  // Track which blocks are already occupied
  // true = block has a process → cannot be reused
  const occupied = new Array(blocks.length).fill(false);

  const allocations = [];
  const unallocated = [];

  for (let i = 0; i < processes.length; i++) {
    const size = Number(processes[i]);
    let selected = -1;

    // --------------------------------------------------
    // FIRST FIT — first free block that can fit
    // --------------------------------------------------
    if (algorithm === "first-fit") {
      for (let j = 0; j < blocks.length; j++) {
        if (!occupied[j] && blocks[j] >= size) {
          selected = j;
          break;
        }
      }
    }

    // --------------------------------------------------
    // BEST FIT — smallest free block that can fit
    // --------------------------------------------------
    else if (algorithm === "best-fit") {
      let best = Infinity;
      for (let j = 0; j < blocks.length; j++) {
        if (!occupied[j] && blocks[j] >= size) {
          const diff = blocks[j] - size;
          if (diff < best) {
            best = diff;
            selected = j;
          }
        }
      }
    }

    // --------------------------------------------------
    // WORST FIT — largest free block that can fit
    // --------------------------------------------------
    else if (algorithm === "worst-fit") {
      let worst = -1;
      for (let j = 0; j < blocks.length; j++) {
        if (!occupied[j] && blocks[j] >= size) {
          const diff = blocks[j] - size;
          if (diff > worst) {
            worst = diff;
            selected = j;
          }
        }
      }
    }

    // --------------------------------------------------
    // PROCESS CANNOT BE ALLOCATED
    // --------------------------------------------------
    if (selected === -1) {
      unallocated.push({
        process: `P${i + 1}`,
        processSize: size,
      });
      continue;
    }

    // --------------------------------------------------
    // LOCK THE BLOCK — no other process can use it now
    // --------------------------------------------------
    occupied[selected] = true;

    const blockSize = blocks[selected];
    const internalFragmentation = blockSize - size;

    allocations.push({
      process: `P${i + 1}`,
      processSize: size,
      block: `B${selected + 1}`,
      blockIndex: selected,
      blockSize: blockSize,
      // remaining is now INTERNAL FRAGMENTATION (wasted, cannot be reused)
      remaining: internalFragmentation,
    });
  }

  // --------------------------------------------------
  // TOTALS
  // --------------------------------------------------
  const totalAllocated = allocations.reduce(
    (sum, a) => sum + a.processSize,
    0
  );

  // Internal fragmentation = sum of (blockSize - processSize) for used blocks
  const totalInternalFragmentation = allocations.reduce(
    (sum, a) => sum + a.remaining,
    0
  );

  // Free memory = sum of unused blocks (completely empty)
  const totalFreeMemory = blocks.reduce(
    (sum, b, i) => sum + (occupied[i] ? 0 : b),
    0
  );

  return {
    algorithm,
    allocations,
    unallocated,
    occupied,                                     // which blocks are locked
    originalBlocks,                               // original block sizes
    totalAllocated,
    totalInternalFragmentation,                   // wasted inside used blocks
    totalFreeMemory,                              // completely free blocks
    totalRemaining: totalFreeMemory,              // shown in "Remaining" stat
  };
}

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Memory Allocation API is running" });
});

// ======================================================
// ALLOCATE ENDPOINT
// ======================================================

app.post("/api/allocate", (req, res) => {
  try {
    const { blocks, processes, algorithm } = req.body;

    if (!Array.isArray(blocks) || !Array.isArray(processes)) {
      return res.status(400).json({ message: "blocks and processes must be arrays" });
    }

    const validBlocks = blocks.map(Number).filter(n => Number.isFinite(n) && n > 0);
    const validProcesses = processes.map(Number).filter(n => Number.isFinite(n) && n > 0);

    if (!validBlocks.length || !validProcesses.length) {
      return res.status(400).json({ message: "Provide valid memory blocks and processes" });
    }

    if (!["first-fit", "best-fit", "worst-fit"].includes(algorithm)) {
      return res.status(400).json({ message: "Invalid allocation algorithm" });
    }

    res.json({ success: true, result: allocate(validBlocks, validProcesses, algorithm) });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ======================================================
// START SERVER
// ======================================================

app.listen(PORT, () => {
  console.log(`Memory Allocation API running at http://localhost:${PORT}`);
});
