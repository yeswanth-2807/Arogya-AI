import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "../components/ui";
import IdCard from "../components/IdCard";
import api from "../api/client";
import { UserPlus, Trash2, Users } from "lucide-react";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [fullUser, setFullUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDep, setNewDep] = useState({ name: "", age: "", gender: "Male", relation: "Child" });

  useEffect(() => {
    if (user && user._id) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await api.getUserProfile(user._id || user.id);
      setFullUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDependent = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.addDependent(user._id || user.id, newDep);
      setFullUser(updated);
      setShowAddForm(false);
      setNewDep({ name: "", age: "", gender: "Male", relation: "Child" });
    } catch (err) {
      alert("Failed to add dependent.");
    }
  };

  const handleDeleteDependent = async (depId) => {
    if (!window.confirm("Remove this family member?")) return;
    try {
      const updated = await api.removeDependent(user._id || user.id, depId);
      setFullUser(updated);
    } catch (err) {
      alert("Failed to remove dependent.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent py-16 px-4 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full text-center space-y-4 shadow-sm text-slate-900 dark:text-white">
          <div className="text-4xl">🔒</div>
          <h2 className="text-xl font-bold">Log in to view Patient Profile</h2>
          <Link to="/login">
            <Button variant="primary" className="w-full font-bold">Log In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayUser = fullUser || user;

  return (
    <div className="min-h-screen bg-transparent py-8 px-4 sm:px-8 transition-colors">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6 text-slate-900 dark:text-white h-fit">
          <div className="flex justify-center border-b border-slate-100 dark:border-slate-800 pb-8">
            <IdCard user={displayUser} type="Patient" />
          </div>

          <div className="flex items-center gap-4 pb-2">
            <div className="w-16 h-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
              {displayUser.name ? displayUser.name.charAt(0).toUpperCase() : "P"}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">{displayUser.name}</h1>
              <div className="inline-flex items-center gap-2 mt-1">
                <span className="text-xs font-bold font-mono bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 px-3 py-1 rounded-full">
                  Patient ID: {displayUser.patientId || "PAT-849204"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Mobile Number</span>
              <strong className="text-slate-900 dark:text-white text-sm mt-0.5 block">{displayUser.phone}</strong>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Age & Gender</span>
              <strong className="text-slate-900 dark:text-white text-sm mt-0.5 block">
                {displayUser.age || "N/A"} yrs · {displayUser.gender || "Male"}
              </strong>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <Link to="/appointments">
              <Button variant="outline" className="text-xs font-bold">View Appointments →</Button>
            </Link>
            <Button variant="ghost" onClick={logout} className="text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950">
              Logout
            </Button>
          </div>
        </div>

        {/* Dependents Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-6 text-slate-900 dark:text-white h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" /> Family & Dependents
            </h2>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add New
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddDependent} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Name</label>
                  <input type="text" required value={newDep.name} onChange={e => setNewDep({...newDep, name: e.target.value})} className="w-full text-sm p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Relation</label>
                  <select value={newDep.relation} onChange={e => setNewDep({...newDep, relation: e.target.value})} className="w-full text-sm p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                    <option>Child</option>
                    <option>Parent</option>
                    <option>Spouse</option>
                    <option>Sibling</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Age</label>
                  <input type="number" required value={newDep.age} onChange={e => setNewDep({...newDep, age: e.target.value})} className="w-full text-sm p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500">Gender</label>
                  <select value={newDep.gender} onChange={e => setNewDep({...newDep, gender: e.target.value})} className="w-full text-sm p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="w-full text-xs font-bold py-1.5" variant="primary">Save Member</Button>
                <Button type="button" onClick={() => setShowAddForm(false)} className="w-full text-xs font-bold py-1.5" variant="outline">Cancel</Button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {!displayUser?.dependents?.length ? (
              <div className="text-center p-6 text-slate-500 text-xs font-semibold">
                No family members added yet. Add dependents to book appointments for them.
              </div>
            ) : (
              displayUser.dependents.map(dep => (
                <div key={dep.id} className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div>
                    <div className="font-bold text-sm flex items-center gap-2">
                      {dep.name} <span className="text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{dep.relation}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {dep.age} yrs • {dep.gender}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteDependent(dep.id || dep._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
