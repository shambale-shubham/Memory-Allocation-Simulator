import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function allocate(blocks, processes, algorithm) {
  const remaining = [...blocks];
  const allocations = [];
  const unallocated = [];

  for (let i = 0; i < processes.length; i++) {
    const size = Number(processes[i]);
    let selected = -1;

    if (algorithm === "first-fit") {
      for (let j = 0; j < remaining.length; j++) {
        if (remaining[j] >= size) {
          selected = j;
          break;
        }
      }
    } else if (algorithm === "best-fit") {
      let best = Infinity;
      for (let j = 0; j < remaining.length; j++) {
        if (remaining[j] >= size && remaining[j] - size < best) {
          best = remaining[j] - size;
          selected = j;
        }
      }
    } else if (algorithm === "worst-fit") {
      let worst = -1;
      for (let j = 0; j < remaining.length; j++) {
        if (remaining[j] >= size && remaining[j] - size > worst) {
          worst = remaining[j] - size;
          selected = j;
        }
      }
    }

    if (selected === -1) {
      unallocated.push({
        process: `P${i + 1}`,
        processSize: size
      });
      continue;
    }

    const blockBefore = remaining[selected];
    remaining[selected] -= size;

    allocations.push({
      process: `P${i + 1}`,
      processSize: size,
      block: `B${selected + 1}`,
      blockIndex: selected,
      blockSize: blockBefore,
      remaining: remaining[selected]
    });
  }

  return {
    algorithm,
    allocations,
    unallocated,
    remainingBlocks: remaining,
    totalRemaining: remaining.reduce((a, b) => a + b, 0),
    totalAllocated: allocations.reduce((a, x) => a + x.processSize, 0),
    totalFragmentation: remaining.reduce((a, b) => a + b, 0)
  };
}

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Memory Allocation API is running" });
});

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

app.listen(PORT, () => {
  console.log(`Memory Allocation API running at http://localhost:${PORT}`);
});
