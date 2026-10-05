"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Folder,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  FileCode,
  CreditCard,
  Calendar,
  User,
  Search,
  ArrowLeft,
  ChevronRight,
  Download,
  Eye,
  ExternalLink,
  Layers,
  HardDrive,
  Clock,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  X,
  File,
  Shield,
  Smartphone,
  Mail,
  Building,
} from "lucide-react";

interface UserFolderSummary {
  id: string;
  userId: string;
  folderName: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  profession: string;
  specialization: string | null;
  organization: string | null;
  city: string | null;
  identityVerified: boolean;
  adminRoles: string[];
  createdAt: string;
  stats: {
    totalItems: number;
    uploadsCount: number;
    textsCount: number;
    paymentsCount: number;
  };
}

interface UserFile {
  id: string;
  name: string;
  extension: string;
  category: string;
  size?: string;
  createdAt: string;
  previewType?: "image" | "document" | "markdown" | "json" | "text";
  url?: string;
  description?: string;
  text?: string;
  data?: any;
  title?: string;
  postType?: string;
  reactions?: number;
  comments?: number;
}

interface UserSubFolder {
  id: string;
  name: string;
  icon: string;
  description: string;
  itemCount: number;
  files: UserFile[];
}

export default function AdminFileManagerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryUserId = searchParams.get("userId");
  const queryFolder = searchParams.get("folder");

  const [loading, setLoading] = useState(true);
  const [userFolders, setUserFolders] = useState<UserFolderSummary[]>([]);
  const [activeUser, setActiveUser] = useState<any | null>(null);
  const [activeSubFolders, setActiveSubFolders] = useState<UserSubFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(queryFolder || null);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [previewFile, setPreviewFile] = useState<UserFile | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // 1. Load Root Users Directory
  const loadRootFolders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/files");
      const data = await res.json();
      if (res.ok) {
        setUserFolders(data.userFolders || []);
      }
    } catch (err) {
      console.error("Failed to load root file folders:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Load Specific User's Virtual Directory
  const loadUserDirectory = async (uid: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/files?userId=${encodeURIComponent(uid)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setActiveUser(data.user);
        setActiveSubFolders(data.folders || []);
      } else {
        setActiveUser(null);
      }
    } catch (err) {
      console.error("Failed to load user directory:", err);
      setActiveUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryUserId) {
      loadUserDirectory(queryUserId);
    } else {
      setActiveUser(null);
      setActiveSubFolders([]);
      setCurrentFolderId(null);
      loadRootFolders();
    }
  }, [queryUserId]);

  const handleOpenUserFolder = (u: UserFolderSummary) => {
    router.push(`/admin/files?userId=${encodeURIComponent(u.userId)}`);
  };

  const handleNavigateRoot = () => {
    setCurrentFolderId(null);
    router.push("/admin/files");
  };

  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return activeSubFolders.find((f) => f.id === currentFolderId) || null;
  }, [currentFolderId, activeSubFolders]);

  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return userFolders;
    const q = searchQuery.toLowerCase();
    return userFolders.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        (f.phone && f.phone.includes(q)) ||
        f.folderName.toLowerCase().includes(q) ||
        f.userId.toLowerCase().includes(q)
    );
  }, [userFolders, searchQuery]);

  const filteredFiles = useMemo(() => {
    if (!currentFolder) return [];
    if (!searchQuery.trim()) return currentFolder.files;
    const q = searchQuery.toLowerCase();
    return currentFolder.files.filter(
      (file) =>
        file.name.toLowerCase().includes(q) ||
        (file.description && file.description.toLowerCase().includes(q)) ||
        (file.text && file.text.toLowerCase().includes(q))
    );
  }, [currentFolder, searchQuery]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadJson = (filename: string, data: any) => {
    const jsonStr = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case "image":
        return <ImageIcon className="size-5 text-sky-600" />;
      case "file-text":
        return <FileText className="size-5 text-emerald-600" />;
      case "user":
        return <User className="size-5 text-indigo-600" />;
      case "calendar":
        return <Calendar className="size-5 text-amber-600" />;
      case "credit-card":
        return <CreditCard className="size-5 text-purple-600" />;
      default:
        return <Folder className="size-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & BREADCRUMBS
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
            <button
              onClick={handleNavigateRoot}
              className={`hover:text-blue-600 transition flex items-center gap-1.5 cursor-pointer font-bold ${
                !activeUser ? "text-slate-900" : ""
              }`}
            >
              <HardDrive className="size-3.5 text-blue-600" />
              <span>Users Drive</span>
            </button>

            {activeUser && (
              <>
                <ChevronRight className="size-3.5 text-slate-300 shrink-0" />
                <button
                  onClick={() => setCurrentFolderId(null)}
                  className={`hover:text-blue-600 transition flex items-center gap-1.5 cursor-pointer font-bold ${
                    !currentFolder ? "text-slate-900" : ""
                  }`}
                >
                  <FolderOpen className="size-3.5 text-amber-500" />
                  <span className="truncate max-w-[200px]">{activeUser.name}</span>
                </button>
              </>
            )}

            {currentFolder && (
              <>
                <ChevronRight className="size-3.5 text-slate-300 shrink-0" />
                <span className="text-slate-900 font-bold flex items-center gap-1.5">
                  <Folder className="size-3.5 text-blue-600" />
                  <span>{currentFolder.name}</span>
                </span>
              </>
            )}
          </div>

          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>User Data File Manager</span>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-md shadow-2xs">
              Explorer
            </span>
          </h1>
        </div>

        {/* Toolbar: Search, View Mode, Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentFolder
                  ? "Search files in folder..."
                  : activeUser
                  ? "Search categories..."
                  : "Search user folders..."
              }
              className="h-9 w-48 sm:w-64 pl-9 pr-3 text-xs bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
            />
          </div>

          <div className="flex items-center border border-slate-200 bg-slate-50 rounded-xl p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "grid" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewMode === "list" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
              title="List View"
            >
              <ListIcon className="size-4" />
            </button>
          </div>

          <button
            onClick={() => {
              if (activeUser) loadUserDirectory(activeUser.id);
              else loadRootFolders();
            }}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. ACTIVE USER HEADER BANNER (WHEN INSIDE A USER FOLDER)
          ───────────────────────────────────────────────────────────── */}
      {activeUser && (
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="size-12 rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden shrink-0 flex items-center justify-center text-blue-600 font-extrabold text-base shadow-2xs">
              {activeUser.image ? (
                <img src={activeUser.image} alt="" className="size-full object-cover" />
              ) : (
                activeUser.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{activeUser.name}</span>
                {activeUser.adminRoles?.length > 0 && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md">
                    {activeUser.adminRoles[0]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="size-3 text-slate-400" />
                  {activeUser.email || "No email"}
                </span>
                {activeUser.phone && (
                  <span className="flex items-center gap-1">
                    <Smartphone className="size-3 text-slate-400" />
                    {activeUser.phone}
                  </span>
                )}
                {activeUser.organization && (
                  <span className="flex items-center gap-1">
                    <Building className="size-3 text-slate-400" />
                    {activeUser.organization}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleDownloadJson(`${activeUser.name}_full_data.json`, activeSubFolders)}
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <Download className="size-3.5 text-slate-500" />
              <span>Export User Bundle (JSON)</span>
            </button>
            <button
              onClick={() => router.push(`/admin/users`)}
              className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="size-3.5 text-slate-500" />
              <span>Back to Users List</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. CONTENT VIEWER: ROOT LEVEL (ALL USER FOLDERS)
          ───────────────────────────────────────────────────────────── */}
      {!activeUser && (
        <div>
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500 font-medium">
            <span>
              Showing <strong className="text-slate-900 font-bold">{filteredFolders.length}</strong> user folders in root directory
            </span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <RefreshCw className="size-6 animate-spin mx-auto mb-2 text-blue-600" />
              <span className="font-semibold text-slate-700">Reading user directories from database...</span>
            </div>
          ) : filteredFolders.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-xs">
              No user folder matches &quot;{searchQuery}&quot;
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFolders.map((u) => (
                <div
                  key={u.userId}
                  onClick={() => handleOpenUserFolder(u)}
                  className="group p-5 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-500 group-hover:scale-105 transition shrink-0 shadow-2xs">
                      <Folder className="size-6 fill-amber-400/30" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-600 transition">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {u.email}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                        {u.profession}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Layers className="size-3.5 text-blue-600" />
                      {u.stats.totalItems} Items
                    </span>
                    <span className="text-slate-400 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">Folder Name</th>
                    <th className="py-3 px-4">Email / Phone</th>
                    <th className="py-3 px-4">Specialization</th>
                    <th className="py-3 px-4 text-center">Uploads</th>
                    <th className="py-3 px-4 text-center">Texts</th>
                    <th className="py-3 px-4 text-right">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFolders.map((u) => (
                    <tr
                      key={u.userId}
                      onClick={() => handleOpenUserFolder(u)}
                      className="hover:bg-slate-50 transition cursor-pointer"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <Folder className="size-4 text-amber-500 fill-amber-400/30 shrink-0" />
                        <span className="truncate max-w-[200px]">{u.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3 px-4 text-slate-500">{u.profession}</td>
                      <td className="py-3 px-4 text-center font-bold text-sky-600">
                        {u.stats.uploadsCount}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600">
                        {u.stats.textsCount}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. LEVEL 2: INSIDE A USER FOLDER — CATEGORY SUB-FOLDERS
          ───────────────────────────────────────────────────────────── */}
      {activeUser && !currentFolder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Select a subfolder to view files and data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSubFolders.map((sf) => (
              <div
                key={sf.id}
                onClick={() => setCurrentFolderId(sf.id)}
                className="group p-5 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl group-hover:scale-105 transition shadow-2xs">
                      {getFolderIcon(sf.icon)}
                    </div>
                    <span className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-full shadow-2xs">
                      {sf.itemCount} files
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                    {sf.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {sf.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Open Folder</span>
                  <ChevronRight className="size-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. LEVEL 3: INSIDE A SUB-FOLDER — LIST OF FILES
          ───────────────────────────────────────────────────────────── */}
      {activeUser && currentFolder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentFolderId(null)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs"
            >
              <ArrowLeft className="size-3.5 text-slate-500" />
              <span>Back to User Categories</span>
            </button>

            <span className="text-xs text-slate-500 font-medium">
              <strong className="text-slate-900 font-bold">{filteredFiles.length}</strong> files in {currentFolder.name}
            </span>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-xs">
              This folder is currently empty.
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setPreviewFile(file)}
                  className="group p-4 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-2xl shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail if image */}
                    {file.previewType === "image" && file.url ? (
                      <div className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="size-full object-cover group-hover:scale-105 transition"
                        />
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl w-fit mb-3 text-slate-700 shadow-2xs">
                        {file.extension === "json" ? (
                          <FileCode className="size-6 text-purple-600" />
                        ) : file.extension === "md" || file.extension === "txt" ? (
                          <FileText className="size-6 text-emerald-600" />
                        ) : (
                          <File className="size-6 text-sky-600" />
                        )}
                      </div>
                    )}

                    <div className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-600 transition">
                      {file.name}
                    </div>
                    {file.description && (
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {file.description}
                      </div>
                    )}
                    {file.text && (
                      <div className="text-[11px] text-slate-600 line-clamp-2 mt-1.5 font-mono bg-slate-50 p-2 rounded-lg border border-slate-200">
                        {file.text}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{file.size || "1 item"}</span>
                    <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description / Details</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      onClick={() => setPreviewFile(file)}
                      className="hover:bg-slate-50 transition cursor-pointer"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        {file.extension === "json" ? (
                          <FileCode className="size-4 text-purple-600 shrink-0" />
                        ) : file.previewType === "image" ? (
                          <ImageIcon className="size-4 text-sky-600 shrink-0" />
                        ) : (
                          <FileText className="size-4 text-emerald-600 shrink-0" />
                        )}
                        <span className="truncate max-w-[200px]">{file.name}</span>
                      </td>
                      <td className="py-3 px-4 uppercase text-[10px] text-slate-500 font-mono font-bold">
                        {file.extension}
                      </td>
                      <td className="py-3 px-4 text-slate-500 truncate max-w-[250px]">
                        {file.description || file.title || (file.text ? file.text.slice(0, 50) : "-")}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{file.size || "-"}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition shadow-2xs"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. FILE PREVIEW MODAL
          ───────────────────────────────────────────────────────────── */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] bg-white border border-slate-200 rounded-2xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                  <File className="size-4 shrink-0" />
                </div>
                <span className="font-bold text-slate-900 text-sm truncate">{previewFile.name}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold">
                  {previewFile.extension}
                </span>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Image Preview */}
              {previewFile.previewType === "image" && previewFile.url && (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-center">
                    <img
                      src={previewFile.url}
                      alt={previewFile.name}
                      className="max-h-[380px] w-auto object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{previewFile.description}</span>
                    <a
                      href={previewFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      <ExternalLink className="size-3.5" />
                      <span>Open Full Media</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Text / Markdown Preview */}
              {(previewFile.previewType === "markdown" || previewFile.previewType === "text") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">File Contents:</span>
                    <button
                      onClick={() => handleCopy(previewFile.text || "")}
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      {copiedText ? (
                        <>
                          <Check className="size-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                    {previewFile.text || "Empty file content."}
                  </div>
                </div>
              )}

              {/* JSON Preview */}
              {previewFile.previewType === "json" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Formatted JSON Record:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(JSON.stringify(previewFile.data, null, 2))}
                        className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer font-semibold"
                      >
                        {copiedText ? (
                          <>
                            <Check className="size-3 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDownloadJson(previewFile.name, previewFile.data)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <Download className="size-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-800 overflow-x-auto max-h-96">
                    {JSON.stringify(previewFile.data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Document / Other file preview */}
              {previewFile.previewType === "document" && previewFile.url && (
                <div className="p-6 text-center space-y-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <FileText className="size-10 mx-auto text-sky-600" />
                  <div className="text-xs font-bold text-slate-900">{previewFile.name}</div>
                  <p className="text-xs text-slate-500">{previewFile.description}</p>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                  >
                    <Download className="size-3.5" />
                    <span>Download Document</span>
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Category: {previewFile.category}</span>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
