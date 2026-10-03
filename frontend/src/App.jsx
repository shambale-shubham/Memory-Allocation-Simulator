import { useMemo, useState } from "react";
import { Cpu, Play, RotateCcw, Plus, Trash2, BarChart3, MemoryStick, CheckCircle2, AlertTriangle } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialBlocks = [100, 500, 200, 300, 600];
const initialProcesses = [212, 417, 112, 426];

function App() {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [processes, setProcesses] = useState(initialProcesses);
  const [algorithm, setAlgorithm] = useState("first-fit");
  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const blockTotal = useMemo(() => blocks.reduce((a,b) => a + Number(b || 0), 0), [blocks]);
  const processTotal = useMemo(() => processes.reduce((a,b) => a + Number(b || 0), 0), [processes]);

  const update = (setter, index, value) => {
    setter(prev => prev.map((v, i) => i === index ? value : v));
  };

  const addValue = (setter) => setter(prev => [...prev, 100]);
  const removeValue = (setter, index) => setter(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);

  async function runOne(algo) {
    const response = await fetch(`${API}/api/allocate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks, processes, algorithm: algo })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Request failed");
    return data.result;
  }

  async function simulate() {
    setLoading(true);
    setError("");
    try {
      const one = await runOne(algorithm);
      setResult(one);

      const all = await Promise.all([
        runOne("first-fit"),
        runOne("best-fit"),
        runOne("worst-fit")
      ]);
      setComparison(all);
    } catch (e) {
      setError(`${e.message}. Make sure the backend is running on port 5000.`);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setBlocks(initialBlocks);
    setProcesses(initialProcesses);
    setAlgorithm("first-fit");
    setResult(null);
    setComparison(null);
    setError("");
  }

  const label = {
    "first-fit": "First Fit",
    "best-fit": "Best Fit",
    "worst-fit": "Worst Fit"
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto max-w-7xl px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/15 p-3 text-indigo-400"><Cpu size={25}/></div>
            <div>
              <h1 className="text-xl font-bold text-white">Memory Allocation Simulator</h1>
              <p className="text-xs text-slate-400">Operating System • OSY • </p>
            </div>
          </div>
          <span className="hidden sm:block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Government Polytechnic College, Washim</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <section className="grid lg:grid-cols-3 gap-5">
          <InputCard title="Memory Blocks" subtitle="Available memory partitions">
            {blocks.map((v,i) => (
              <div className="flex gap-2" key={i}>
                <input type="number" min="1" value={v} onChange={e => update(setBlocks,i,e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"/>
                <button onClick={() => removeValue(setBlocks,i)} className="rounded-lg border border-slate-700 px-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
              </div>
            ))}
            <button onClick={() => addValue(setBlocks)} className="mt-3 flex items-center gap-1 text-sm text-indigo-400"><Plus size={16}/> Add Block</button>
          </InputCard>

          <InputCard title="Processes" subtitle="Process memory requirements">
            {processes.map((v,i) => (
              <div className="flex gap-2" key={i}>
                <input type="number" min="1" value={v} onChange={e => update(setProcesses,i,e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-indigo-500"/>
                <button onClick={() => removeValue(setProcesses,i)} className="rounded-lg border border-slate-700 px-2 text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
              </div>
            ))}
            <button onClick={() => addValue(setProcesses)} className="mt-3 flex items-center gap-1 text-sm text-indigo-400"><Plus size={16}/> Add Process</button>
          </InputCard>

          <InputCard title="Allocation Strategy" subtitle="Choose an algorithm">
            {["first-fit","best-fit","worst-fit"].map(a => (
              <label key={a} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 ${algorithm === a ? "border-indigo-500 bg-indigo-500/10" : "border-slate-700"}`}>
                <input type="radio" checked={algorithm === a} onChange={() => setAlgorithm(a)} />
                <span className="text-sm text-white">{label[a]}</span>
              </label>
            ))}
            <div className="mt-4 flex gap-2">
              <button onClick={simulate} disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
                <Play size={17}/>{loading ? "Running..." : "Run Simulation"}
              </button>
              <button onClick={reset} className="rounded-xl border border-slate-700 px-4 text-slate-300 hover:bg-slate-800"><RotateCcw size={17}/></button>
            </div>
          </InputCard>
        </section>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

        {result && (
          <>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Memory Visualization</h2>
                  <p className="text-sm text-slate-400">{label[result.algorithm]} allocation result</p>
                </div>
                <MemoryStick className="text-indigo-400"/>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {blocks.map((size,i) => {
                  const used = result.allocations.filter(x => x.blockIndex === i).reduce((a,x) => a + x.processSize, 0);
                  const remaining = Math.max(0, Number(size) - used);
                  return (
                    <div key={i} className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-semibold text-white">B{i+1}</span>
                        <span className="text-slate-400">{size} KB</span>
                      </div>
                      <div className="h-8 overflow-hidden rounded-lg bg-slate-800">
                        {used > 0 && <div className="flex h-full items-center justify-center bg-indigo-600 text-xs font-bold text-white" style={{width:`${Math.min(100, used/Number(size)*100)}%`}}>Used {used}</div>}
                      </div>
                      <p className="mt-2 text-xs text-slate-400">Remaining: <b className="text-emerald-400">{remaining} KB</b></p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat icon={<CheckCircle2/>} title="Allocated" value={`${result.allocations.length}/${processes.length}`}/>
              <Stat icon={<AlertTriangle/>} title="Unallocated" value={result.unallocated.length}/>
              <Stat icon={<BarChart3/>} title="Allocated Memory" value={`${result.totalAllocated} KB`}/>
              <Stat icon={<MemoryStick/>} title="Remaining" value={`${result.totalRemaining} KB`}/>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
              <div className="p-5 border-b border-slate-800"><h2 className="font-bold text-white">Allocation Details</h2></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950 text-slate-400"><tr><th className="p-3 text-left">Process</th><th className="p-3 text-left">Size</th><th className="p-3 text-left">Block</th><th className="p-3 text-left">Block Size</th><th className="p-3 text-left">Remaining</th></tr></thead>
                  <tbody>
                    {result.allocations.map(x => <tr key={x.process} className="border-t border-slate-800"><td className="p-3 font-semibold text-white">{x.process}</td><td className="p-3">{x.processSize} KB</td><td className="p-3 text-indigo-300">{x.block}</td><td className="p-3">{x.blockSize} KB</td><td className="p-3 text-emerald-400">{x.remaining} KB</td></tr>)}
                    {result.unallocated.map(x => <tr key={x.process} className="border-t border-slate-800"><td className="p-3 font-semibold text-white">{x.process}</td><td className="p-3">{x.processSize} KB</td><td className="p-3 text-red-400" colSpan="3">Not allocated</td></tr>)}
                  </tbody>
                </table>
              </div>
            </section>

            {comparison && <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h2 className="mb-4 flex items-center gap-2 font-bold text-white"><BarChart3 size={19}/> Algorithm Comparison</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {comparison.map(x => <div key={x.algorithm} className={`rounded-xl border p-4 ${x.algorithm === algorithm ? "border-indigo-500" : "border-slate-700"}`}>
                  <h3 className="font-semibold text-white">{label[x.algorithm]}</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate-400">
                    <p>Allocated processes: <b className="text-white">{x.allocations.length}</b></p>
                    <p>Unallocated processes: <b className="text-white">{x.unallocated.length}</b></p>
                    <p>Allocated memory: <b className="text-white">{x.totalAllocated} KB</b></p>
                    <p>Remaining memory: <b className="text-white">{x.totalRemaining} KB</b></p>
                  </div>
                </div>)}
              </div>
            </section>}
          </>
        )}

        <footer className="pb-8 text-center text-xs text-slate-500 pt-10 ">
         • OSY  Project • Memory Allocation Strategy Simulator •<br/>
          Operating System – 315319<br/>

5th Semester Diploma in Information Technology<br/>

© 2026 Developed by Shubham Vijaykumar  shambale<br/>
        </footer>
      </main>
    </div>
  );
}

function InputCard({title, subtitle, children}) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
    <h2 className="font-bold text-white">{title}</h2>
    <p className="mb-4 text-xs text-slate-500">{subtitle}</p>
    <div className="space-y-2">{children}</div>
  </div>;
}

function Stat({icon,title,value}) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
    <div className="mb-2 text-indigo-400">{icon}</div>
    <p className="text-xs text-slate-500">{title}</p>
    <p className="mt-1 text-xl font-bold text-white">{value}</p>
  </div>;
}

export default App;
