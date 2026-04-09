"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { GraphCanvas } from "@/components/GraphCanvas";

export default function Home() {
  const { data: session, status } = useSession();
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [seedError, setSeedError] = useState<string | null>(null);
  const [seedForm, setSeedForm] = useState({ firstName: '', lastName: '', gender: '', bio: '', college: '', currentCity: '' });

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/graph/nodes")
        .then(res => res.json())
        .then(data => {
          setGraphData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const handleSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSeedError(null);
    try {
      const res = await fetch("/api/graph/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seedForm),
      });
      
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = errBody.error || `Seed failed with status ${res.status}`;
        console.error("Seed API error:", msg);
        setSeedError(msg);
        setLoading(false);
        return;
      }

      // Seed succeeded — reload graph data
      const nodesRes = await fetch("/api/graph/nodes");
      if (!nodesRes.ok) {
        setSeedError("Seed was saved but failed to reload graph. Please refresh the page.");
        setLoading(false);
        return;
      }
      const newData = await nodesRes.json();
      setGraphData(newData);
    } catch(err: any) {
      console.error("Seed network error:", err);
      setSeedError(err.message || "Network error — is the server running?");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-white min-h-screen p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700 text-center">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Gotaavalaa</h1>
          <p className="text-gray-400 mb-8">Your private, collaborative personal network graph.</p>
          <button 
            onClick={() => signIn()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-blue-500/20"
          >
            Sign In / Create Tree
          </button>
        </div>
      </div>
    );
  }

  // If no nodes, show seed form
  if (graphData && (!graphData.nodes || graphData.nodes.length === 0)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 text-white min-h-screen p-4">
        <div className="max-w-xl w-full bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-700">
          <h2 className="text-2xl font-bold mb-6">Welcome, {session?.user?.name}</h2>
          <p className="text-gray-400 mb-8">Let's seed your personal garden. Tell us a bit about yourself to kick things off.</p>
          
          <form onSubmit={handleSeed} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="First Name" value={seedForm.firstName} onChange={e => setSeedForm({...seedForm, firstName: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"/>
              <input required placeholder="Last Name" value={seedForm.lastName} onChange={e => setSeedForm({...seedForm, lastName: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"/>
            </div>
            
            <input placeholder="Gender / Pronouns" value={seedForm.gender} onChange={e => setSeedForm({...seedForm, gender: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"/>
            <textarea placeholder="Bio / Headline (e.g. Software Engineer, Avid Hiker)" value={seedForm.bio} onChange={e => setSeedForm({...seedForm, bio: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 min-h-[100px]"/>
            
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="College / University" value={seedForm.college} onChange={e => setSeedForm({...seedForm, college: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"/>
              <input required placeholder="Current City" value={seedForm.currentCity} onChange={e => setSeedForm({...seedForm, currentCity: e.target.value})} className="bg-gray-900 border border-gray-700 rounded-xl p-3 focus:ring-2 focus:ring-blue-500"/>
            </div>

            {seedError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">
                <strong>Error:</strong> {seedError}
              </div>
            )}

            <button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-green-500/20">
              Plant Seed
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 overflow-hidden">
       {/* Top Bar */}
       <div className="h-14 bg-gray-900/80 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">G</div>
             <span className="font-semibold text-white tracking-wide">Gotaavalaa</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-sm text-gray-400">Tree: <span className="text-gray-200 font-medium">{session?.user?.name}</span></span>
             <button onClick={() => signOut()} className="text-sm text-gray-400 hover:text-white transition-colors bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-700">
                Sign Out
             </button>
          </div>
       </div>

       {/* Canvas Area */}
       <div className="flex-1 w-full relative">
          <GraphCanvas initialData={graphData} />
       </div>
    </div>
  );
}
