import { useMemo, useState } from "react";

import {
  Cpu,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  BarChart3,
  MemoryStick,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

// ======================================================
// BACKEND API
// ======================================================

const API =
  import.meta.env.VITE_API_URL ||
  "https://memory-allocation-simulator-3.onrender.com";

// ======================================================
// DEFAULT DATA
// ======================================================

const initialBlocks = [100, 500, 200, 300, 600];

const initialProcesses = [212, 417, 112, 426];

// ======================================================
// MAIN APP
// ======================================================

function App() {
  // ----------------------------------------------------
  // STATE
  // ----------------------------------------------------

  const [blocks, setBlocks] = useState(initialBlocks);

  const [processes, setProcesses] = useState(initialProcesses);

  const [algorithm, setAlgorithm] = useState("first-fit");

  const [result, setResult] = useState(null);

  const [comparison, setComparison] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ----------------------------------------------------
  // TOTALS
  // ----------------------------------------------------

  const blockTotal = useMemo(() => {
    return blocks.reduce((total, value) => {
      return total + Number(value || 0);
    }, 0);
  }, [blocks]);

  const processTotal = useMemo(() => {
    return processes.reduce((total, value) => {
      return total + Number(value || 0);
    }, 0);
  }, [processes]);

  // ----------------------------------------------------
  // ALGORITHM LABEL
  // ----------------------------------------------------

  const algorithmLabels = {
    "first-fit": "First Fit",
    "best-fit": "Best Fit",
    "worst-fit": "Worst Fit",
  };

  // ----------------------------------------------------
  // UPDATE INPUT
  // ----------------------------------------------------

  const updateValue = (setter, index, value) => {
    setter((previous) =>
      previous.map((item, currentIndex) =>
        currentIndex === index ? value : item
      )
    );
  };

  // ----------------------------------------------------
  // ADD BLOCK / PROCESS
  // ----------------------------------------------------

  const addBlock = () => {
    setBlocks((previous) => [...previous, 100]);
  };

  const addProcess = () => {
    setProcesses((previous) => [...previous, 100]);
  };

  // ----------------------------------------------------
  // REMOVE BLOCK / PROCESS
  // ----------------------------------------------------

  const removeBlock = (index) => {
    if (blocks.length <= 1) return;

    setBlocks((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const removeProcess = (index) => {
    if (processes.length <= 1) return;

    setProcesses((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  // ====================================================
  // API CALL
  // ====================================================

  const runOne = async (selectedAlgorithm) => {
    const cleanBlocks = blocks
      .map(Number)
      .filter((value) => Number.isFinite(value) && value > 0);

    const cleanProcesses = processes
      .map(Number)
      .filter((value) => Number.isFinite(value) && value > 0);

    const response = await fetch(`${API}/api/allocate`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        blocks: cleanBlocks,
        processes: cleanProcesses,
        algorithm: selectedAlgorithm,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Allocation request failed");
    }

    return data.result;
  };

  // ====================================================
  // RUN SIMULATION
  // ====================================================

  const simulate = async () => {
    setLoading(true);
    setError("");

    try {
      // Selected algorithm
      const selectedResult = await runOne(algorithm);

      setResult(selectedResult);

      // Run all algorithms for comparison
      const allResults = await Promise.all([
        runOne("first-fit"),
        runOne("best-fit"),
        runOne("worst-fit"),
      ]);

      setComparison(allResults);
    } catch (error) {
      console.error(error);

      setError(
        `${error.message}. Please make sure your backend is running.`
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // RESET
  // ====================================================

  const reset = () => {
    setBlocks(initialBlocks);

    setProcesses(initialProcesses);

    setAlgorithm("first-fit");

    setResult(null);

    setComparison(null);

    setError("");
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-slate-800 bg-slate-900/80">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-400">
              <Cpu size={25} />
            </div>

            <div>

              <h1 className="text-xl font-bold">
                Memory Allocation Simulator
              </h1>

              <p className="text-xs text-slate-400">
                Operating System • OSY
              </p>

            </div>

          </div>

          <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 sm:block">
            Government Polytechnic College, Washim
          </span>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">

        {/* =================================================
            INPUT SECTION
        ================================================= */}

        <section className="grid gap-5 lg:grid-cols-3">

          {/* MEMORY BLOCKS */}

          <InputCard
            title="Memory Blocks"
            subtitle="Available memory partitions"
          >

            {blocks.map((value, index) => (

              <div
                className="flex gap-2"
                key={`block-${index}`}
              >

                <input
                  type="number"
                  min="1"
                  value={value}
                  onChange={(event) =>
                    updateValue(
                      setBlocks,
                      index,
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-indigo-500"
                />

                <button
                  onClick={() => removeBlock(index)}
                  className="rounded-lg border border-slate-700 px-3 text-slate-400 transition hover:border-red-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>

              </div>

            ))}

            <button
              onClick={addBlock}
              className="mt-3 flex items-center gap-1 text-sm text-indigo-400 transition hover:text-indigo-300"
            >
              <Plus size={16} />
              Add Block
            </button>

            <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500">
              Total Memory:{" "}
              <span className="font-semibold text-white">
                {blockTotal} KB
              </span>
            </div>

          </InputCard>

          {/* PROCESSES */}

          <InputCard
            title="Processes"
            subtitle="Process memory requirements"
          >

            {processes.map((value, index) => (

              <div
                className="flex gap-2"
                key={`process-${index}`}
              >

                <input
                  type="number"
                  min="1"
                  value={value}
                  onChange={(event) =>
                    updateValue(
                      setProcesses,
                      index,
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-indigo-500"
                />

                <button
                  onClick={() => removeProcess(index)}
                  className="rounded-lg border border-slate-700 px-3 text-slate-400 transition hover:border-red-500 hover:text-red-400"
                >
                  <Trash2 size={16} />
                </button>

              </div>

            ))}

            <button
              onClick={addProcess}
              className="mt-3 flex items-center gap-1 text-sm text-indigo-400 transition hover:text-indigo-300"
            >
              <Plus size={16} />
              Add Process
            </button>

            <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500">
              Total Process Memory:{" "}
              <span className="font-semibold text-white">
                {processTotal} KB
              </span>
            </div>

          </InputCard>

          {/* ALGORITHM */}

          <InputCard
            title="Allocation Strategy"
            subtitle="Choose an algorithm"
          >

            {[
              "first-fit",
              "best-fit",
              "worst-fit",
            ].map((item) => (

              <label
                key={item}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                  algorithm === item
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >

                <input
                  type="radio"
                  name="algorithm"
                  checked={algorithm === item}
                  onChange={() => setAlgorithm(item)}
                />

                <span className="text-sm text-white">
                  {algorithmLabels[item]}
                </span>

              </label>

            ))}

            <div className="mt-4 flex gap-2">

              <button
                onClick={simulate}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <Play size={17} />

                {loading
                  ? "Running..."
                  : "Run Simulation"}

              </button>

              <button
                onClick={reset}
                className="rounded-xl border border-slate-700 px-4 text-slate-300 transition hover:bg-slate-800"
              >
                <RotateCcw size={17} />
              </button>

            </div>

          </InputCard>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>

        )}

        {/* =================================================
            RESULT
        ================================================= */}

        {result && (

          <>

            {/* =================================================
                MEMORY VISUALIZATION
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h2 className="text-lg font-bold">
                    Memory Visualization
                  </h2>

                  <p className="text-sm text-slate-400">
                    {algorithmLabels[result.algorithm]} allocation result
                  </p>

                </div>

                <MemoryStick className="text-indigo-400" />

              </div>

              {/* =================================================
                  MEMORY BLOCKS
              ================================================= */}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                {blocks.map((size, index) => {

                  const blockSize = Number(size);

                  // IMPORTANT:
                  // Get every process allocated inside this block.
                  const blockAllocations =
                    result.allocations.filter(
                      (allocation) =>
                        allocation.blockIndex === index
                    );

                  // Calculate total used memory
                  const used = blockAllocations.reduce(
                    (total, allocation) =>
                      total +
                      Number(allocation.processSize),
                    0
                  );

                  // Calculate remaining memory
                  const remaining = Math.max(
                    0,
                    blockSize - used
                  );

                  return (

                    <div
                      key={`visual-block-${index}`}
                      className="rounded-xl border border-slate-700 bg-slate-950 p-4"
                    >

                      {/* BLOCK HEADER */}

                      <div className="mb-3 flex items-center justify-between">

                        <span className="font-semibold text-white">
                          B{index + 1}
                        </span>

                        <span className="text-sm text-slate-400">
                          {blockSize} KB
                        </span>

                      </div>

                      {/* =================================================
                          MEMORY BAR
                      ================================================= */}

                      <div className="flex h-10 w-full overflow-hidden rounded-lg bg-slate-800">

                        {/* PROCESS SEGMENTS */}

                        {blockAllocations.map(
                          (allocation, allocationIndex) => {

                            const processSize =
                              Number(
                                allocation.processSize
                              );

                            const width =
                              (processSize /
                                blockSize) *
                              100;

                            return (

                              <div
                                key={`${allocation.process}-${allocationIndex}`}
                                className="flex items-center justify-center border-r border-slate-950 bg-indigo-600 px-1 text-xs font-bold text-white transition hover:bg-indigo-500"
                                style={{
                                  width: `${width}%`,
                                  minWidth: "50px",
                                }}
                                title={`${allocation.process}: ${processSize} KB`}
                              >

                                <span>
                                  {allocation.process}
                                </span>

                              </div>

                            );
                          }
                        )}

                        {/* REMAINING MEMORY */}

                        {remaining > 0 && (

                          <div
                            className="flex items-center justify-center bg-slate-700 text-xs font-semibold text-slate-300"
                            style={{
                              width: `${
                                (remaining /
                                  blockSize) *
                                100
                              }%`,
                            }}
                            title={`Remaining: ${remaining} KB`}
                          >

                            {remaining >= 50
                              ? `${remaining} KB`
                              : ""}

                          </div>

                        )}

                      </div>

                      {/* =================================================
                          PROCESS DETAILS
                      ================================================= */}

                      {blockAllocations.length > 0 && (

                        <div className="mt-3 space-y-1">

                          {blockAllocations.map(
                            (allocation, allocationIndex) => (

                              <div
                                key={`${allocation.process}-detail-${allocationIndex}`}
                                className="flex items-center justify-between rounded-md bg-slate-900 px-2 py-1 text-xs"
                              >

                                <span className="font-semibold text-indigo-300">
                                  {allocation.process}
                                </span>

                                <span className="text-slate-400">
                                  {allocation.processSize} KB
                                </span>

                              </div>

                            )
                          )}

                        </div>

                      )}

                      {/* =================================================
                          REMAINING
                      ================================================= */}

                      <p className="mt-3 text-xs text-slate-400">

                        Remaining:{" "}

                        <b className="text-emerald-400">
                          {remaining} KB
                        </b>

                      </p>

                    </div>

                  );

                })}

              </div>

            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

              <Stat
                icon={<CheckCircle2 />}
                title="Allocated"
                value={`${result.allocations.length}/${processes.length}`}
              />

              <Stat
                icon={<AlertTriangle />}
                title="Unallocated"
                value={result.unallocated.length}
              />

              <Stat
                icon={<BarChart3 />}
                title="Allocated Memory"
                value={`${result.totalAllocated} KB`}
              />

              <Stat
                icon={<MemoryStick />}
                title="Remaining"
                value={`${result.totalRemaining} KB`}
              />

            </section>

            {/* =================================================
                ALLOCATION DETAILS
            ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

              <div className="border-b border-slate-800 p-5">

                <h2 className="font-bold text-white">
                  Allocation Details
                </h2>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-slate-950 text-slate-400">

                    <tr>

                      <th className="p-4 text-left">
                        Process
                      </th>

                      <th className="p-4 text-left">
                        Size
                      </th>

                      <th className="p-4 text-left">
                        Block
                      </th>

                      <th className="p-4 text-left">
                        Block Size
                      </th>

                      <th className="p-4 text-left">
                        Remaining
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {/* ALLOCATED PROCESSES */}

                    {result.allocations.map(
                      (allocation) => (

                        <tr
                          key={allocation.process}
                          className="border-t border-slate-800 transition hover:bg-slate-800/50"
                        >

                          <td className="p-4 font-semibold text-white">
                            {allocation.process}
                          </td>

                          <td className="p-4">
                            {allocation.processSize} KB
                          </td>

                          <td className="p-4 font-semibold text-indigo-300">
                            {allocation.block}
                          </td>

                          <td className="p-4">
                            {allocation.blockSize} KB
                          </td>

                          <td className="p-4 font-semibold text-emerald-400">
                            {allocation.remaining} KB
                          </td>

                        </tr>

                      )
                    )}

                    {/* UNALLOCATED PROCESSES */}

                    {result.unallocated.map(
                      (process) => (

                        <tr
                          key={process.process}
                          className="border-t border-slate-800"
                        >

                          <td className="p-4 font-semibold text-white">
                            {process.process}
                          </td>

                          <td className="p-4">
                            {process.processSize} KB
                          </td>

                          <td
                            className="p-4 font-semibold text-red-400"
                            colSpan="3"
                          >
                            Not Allocated
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* =================================================
                ALGORITHM COMPARISON
            ================================================= */}

            {comparison && (

              <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

                <h2 className="mb-4 flex items-center gap-2 font-bold text-white">

                  <BarChart3 size={19} />

                  Algorithm Comparison

                </h2>

                <div className="grid gap-4 md:grid-cols-3">

                  {comparison.map((item) => (

                    <div
                      key={item.algorithm}
                      className={`rounded-xl border p-4 ${
                        item.algorithm === algorithm
                          ? "border-indigo-500 bg-indigo-500/5"
                          : "border-slate-700"
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <h3 className="font-semibold text-white">
                          {algorithmLabels[item.algorithm]}
                        </h3>

                        {item.algorithm ===
                          algorithm && (

                          <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-xs text-indigo-300">
                            Selected
                          </span>

                        )}

                      </div>

                      <div className="mt-4 space-y-2 text-sm text-slate-400">

                        <p className="flex justify-between">
                          <span>
                            Allocated:
                          </span>

                          <b className="text-white">
                            {item.allocations.length}
                          </b>
                        </p>

                        <p className="flex justify-between">
                          <span>
                            Unallocated:
                          </span>

                          <b className="text-white">
                            {item.unallocated.length}
                          </b>
                        </p>

                        <p className="flex justify-between">
                          <span>
                            Allocated Memory:
                          </span>

                          <b className="text-white">
                            {item.totalAllocated} KB
                          </b>
                        </p>

                        <p className="flex justify-between">
                          <span>
                            Remaining:
                          </span>

                          <b className="text-white">
                            {item.totalRemaining} KB
                          </b>
                        </p>

                      </div>

                    </div>

                  ))}

                </div>

              </section>

            )}

          </>

        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="pb-8 pt-10 text-center text-xs text-slate-500">

          <p>
            • OSY Project • Memory Allocation Strategy Simulator •
          </p>

          <p className="mt-1">
            Operating System – 315319
          </p>

          <p className="mt-1">
            5th Semester Diploma in Information Technology
          </p>

          <p className="mt-1">
            © 2026 Developed by Shubham Vijaykumar Shambale
          </p>

        </footer>

      </main>

    </div>
  );
}

// ======================================================
// INPUT CARD COMPONENT
// ======================================================

function InputCard({
  title,
  subtitle,
  children,
}) {
  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <h2 className="font-bold text-white">
        {title}
      </h2>

      <p className="mb-4 text-xs text-slate-500">
        {subtitle}
      </p>

      <div className="space-y-2">
        {children}
      </div>

    </div>

  );
}

// ======================================================
// STAT COMPONENT
// ======================================================

function Stat({
  icon,
  title,
  value,
}) {
  return (

    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

      <div className="mb-2 text-indigo-400">
        {icon}
      </div>

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>

    </div>

  );
}

// ======================================================
// EXPORT
// ======================================================

export default App;