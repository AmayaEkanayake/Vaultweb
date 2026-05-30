import React, { useContext, useEffect, useState } from "react";
import { Lock, Eye, EyeOff, Search, Plus, Trash2, Copy } from "lucide-react";
import { decryptData } from "../utilites/cryptoUtilities";
import { retriveUserSecrets } from "../utilites/netUtilities";
import { UserContext } from "../UserContext";

const MyVault = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [decryptedId, setDecryptedId] = useState(null);
  const userInfo = useContext(UserContext);
  const [vaultItems, setVaultItems] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await retriveUserSecrets(userInfo.uuID);
      setVaultItems(result);
    })();
  }, [userInfo.uuID]);

  // Mock Data: In reality, 'value' would be an Encrypted Blob from your DB

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-[Poppins] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Personal <span className="text-purple-500">Vault</span>
            </h1>
            <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-mono">
              End-to-End Encrypted Environment
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search secrets..."
                className="bg-slate-900 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none w-64 transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-purple-900/20">
              <Plus size={18} /> New Secret
            </button>
          </div>
        </div>

        {/* Vault Table Card */}
        <div className="bg-slate-900/40 border border-white/5 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5">
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Secret Name
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Category
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Modified
                </th>
                <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {vaultItems
                .filter((item) =>
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                          <Lock size={16} />
                        </div>
                        <span className="font-semibold text-white">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-mono italic">
                      {item.date}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-3">
                        <div
                          className={`px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 ${decryptedId === item.id ? "bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30" : "bg-slate-800/50 text-slate-600 blur-sm select-none"}`}
                        >
                          {decryptedId === item.id
                            ? item.value
                            : "••••••••••••"}
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 hover:text-white text-slate-500 transition-colors"
                            title="Copy"
                          >
                            <Copy size={16} />
                          </button>
                          <button
                            onClick={() => setDecryptedId(decryptData(item.id, userInfo.userKey))}
                            className="p-2 hover:text-white text-slate-500 transition-colors"
                            title={decryptedId === item.id ? "Hide" : "Decrypt"}
                          >
                            {decryptedId === item.id ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                          <button className="p-2 hover:text-red-400 text-slate-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Empty State Mockup */}
          {vaultItems.length === 0 && (
            <div className="py-20 text-center">
              <Lock size={48} className="mx-auto text-slate-800 mb-4" />
              <p className="text-slate-500 font-medium">
                Your vault is empty. Start securing your data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyVault;
