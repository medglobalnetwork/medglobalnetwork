"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FileText,
  Lock,
  Minus,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import { BookItem, BookTableOfContentsItem } from "@/modules/learn/types";
import { PdfViewer } from "@/components/media/PdfViewer";

type BookFilter = "all" | "free" | "paid" | "saved";

export default function BooksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const [books, setBooks] = React.useState<BookItem[]>([]);
  const [filter, setFilter] = React.useState<BookFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  // Active Reader Modal State
  const [activeReadingBook, setActiveReadingBook] = React.useState<BookItem | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [readerZoom, setReaderZoom] = React.useState(100);
  const [showToc, setShowToc] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const loadBooks = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams();
        if (filter !== "all" && filter !== "saved") query.set("access", filter);
        if (searchQuery.trim()) query.set("search", searchQuery.trim());

        const res = await fetch(`/api/learn/books?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data.books || []);
        }
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [session?.user, filter, searchQuery]);

  const handleOpenReader = (book: BookItem) => {
    setActiveReadingBook(book);
    setCurrentPage(book.user_progress?.current_page || 1);
  };

  const handlePageChange = async (newPage: number) => {
    if (!activeReadingBook) return;
    const clamped = Math.max(1, Math.min(newPage, activeReadingBook.page_count));
    setCurrentPage(clamped);

    // Save reading progress to backend
    try {
      await fetch("/api/learn/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_id: activeReadingBook.id,
          current_page: clamped,
          total_pages: activeReadingBook.page_count,
        }),
      });
    } catch {
      // Non-fatal
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      <StudentNavHeader activeTab="resources" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/learn"
                className="p-1.5 rounded-xl hover:bg-[#f0efee] dark:hover:bg-[#21262d] text-[#77716b] dark:text-[#8b949e] transition"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-2xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                Medical Books & Clinical Manuals 📚
              </h1>
            </div>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 ml-8">
              Open-access textbooks, clinical atlases, and licensed reference handbooks for medical scholars.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(["all", "free", "paid"] as BookFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                  filter === tab
                    ? "bg-[#0f4c81] text-white"
                    : "bg-[#f5f4f2] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:bg-[#e8e6e3]"
                }`}
              >
                {tab === "all" ? "All Books" : `${tab} Books`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#9c958f]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or subject..."
              className="w-full bg-[#f8f7f6] dark:bg-[#21262d] pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl h-64 animate-pulse"
              />
            ))}
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => {
              const isFree = book.access === "FREE";

              return (
                <div
                  key={book.id}
                  className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Cover / Header */}
                    <div className="flex gap-4">
                      <div className="w-24 h-32 rounded-xl bg-gradient-to-tr from-[#0f4c81] to-[#1c6eb8] shrink-0 overflow-hidden shadow-sm relative">
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-30 text-white">
                            <BookOpen className="size-8" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#0f4c81] dark:text-[#58a6ff]">
                          {book.category}
                        </span>
                        <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-2 leading-snug">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[#77716b] dark:text-[#8b949e] truncate">
                          {book.author}
                        </p>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold pt-1">
                          <Star className="size-3 fill-amber-500" />
                          <span>{book.rating_avg}</span>
                          <span className="text-[10px] text-[#77716b] font-normal">
                            ({book.rating_count})
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#5d5854] dark:text-[#8b949e] line-clamp-2 leading-relaxed">
                      {book.description}
                    </p>
                  </div>

                  {/* Footer & Read / Buy Actions */}
                  <div className="p-5 pt-3 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between">
                    <div>
                      {isFree ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Free Access
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                            ₹{book.discount_price || book.price}
                          </span>
                          {book.discount_price && (
                            <span className="text-[11px] text-[#9c958f] line-through">
                              ₹{book.price}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {isFree || book.user_has_access ? (
                      <button
                        type="button"
                        onClick={() => handleOpenReader(book)}
                        className="px-4 py-1.5 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <BookOpen className="size-3.5" /> Read
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert(`Purchase flow initialized for ${book.title}.`)}
                        className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0f4c81] text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Lock className="size-3.5" /> Buy Book
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-12 text-center text-xs text-[#77716b]">
            No medical books match your search.
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* IN-APP EBOOK READER MODAL */}
        {/* ───────────────────────────────────────────── */}
        {activeReadingBook && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-center items-center p-4">
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Reader Topbar */}
              <div className="p-4 border-b border-[#f0efee] dark:border-[#21262d] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveReadingBook(null)}
                    className="p-1.5 rounded-xl hover:bg-[#f0efee] dark:hover:bg-[#21262d] text-[#77716b]"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] truncate">
                      {activeReadingBook.title}
                    </h3>
                    <p className="text-[10px] text-[#77716b] truncate">
                      {activeReadingBook.author} • Page {currentPage} of {activeReadingBook.page_count}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowToc(!showToc)}
                    className="px-3 py-1 text-xs font-semibold rounded-xl bg-[#f5f4f2] dark:bg-[#21262d] hover:bg-[#e8e6e3] transition"
                  >
                    TOC
                  </button>
                  <div className="flex items-center gap-1 bg-[#f5f4f2] dark:bg-[#21262d] p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setReaderZoom((z) => Math.max(z - 10, 70))}
                      className="p-1 rounded-lg"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="text-[10px] font-mono font-bold px-1">{readerZoom}%</span>
                    <button
                      type="button"
                      onClick={() => setReaderZoom((z) => Math.min(z + 10, 140))}
                      className="p-1 rounded-lg"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Reader Body */}
              <div className="flex-1 flex overflow-hidden">
                {/* Table of Contents Drawer */}
                {showToc && activeReadingBook.table_of_contents && (
                  <div className="w-64 border-r border-[#f0efee] dark:border-[#21262d] p-4 overflow-y-auto space-y-2 bg-[#faf9f8] dark:bg-[#0d1117] shrink-0">
                    <h4 className="text-xs font-bold uppercase text-[#77716b]">Table of Contents</h4>
                    {activeReadingBook.table_of_contents.map((toc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handlePageChange(toc.page);
                          setShowToc(false);
                        }}
                        className="w-full text-left p-2 rounded-xl text-xs hover:bg-[#f0efee] dark:hover:bg-[#21262d] font-medium"
                      >
                        {toc.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Page Content Simulator / Real PDF Viewer */}
                <div className="flex-1 overflow-hidden bg-[#faf9f8] dark:bg-[#0d1117] flex items-center justify-center p-2 sm:p-4">
                  {activeReadingBook.file_url ? (
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm">
                      <PdfViewer
                        url={activeReadingBook.file_url}
                        title={activeReadingBook.title}
                        initialPage={currentPage}
                        onPageChange={(p) => handlePageChange(p)}
                        className="h-full min-h-[550px]"
                      />
                    </div>
                  ) : (
                    <div
                      className="max-w-2xl bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-8 shadow-xs space-y-4 text-xs leading-relaxed overflow-y-auto"
                      style={{ transform: `scale(${readerZoom / 100})`, transformOrigin: "top center" }}
                    >
                      <div className="flex items-center justify-between border-b border-[#f0efee] dark:border-[#21262d] pb-2 text-[10px] text-[#77716b]">
                        <span>{activeReadingBook.title}</span>
                        <span>Page {currentPage}</span>
                      </div>

                      <h4 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                        Section {currentPage}: Clinical Principles & Localization
                      </h4>

                      <p>
                        In modern clinical medicine, systematic anatomical and physiological evaluation provides the foundation for accurate diagnostic decision-making. Comprehending structural spatial relationships allows rapid correlation between presenting neurological or orthopedic signs and the underlying lesion locus.
                      </p>

                      <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 font-semibold text-[#0f4c81] dark:text-[#58a6ff]">
                        Key Takeaway: Always synthesize motor, sensory, and autonomic findings before ordering advanced imaging.
                      </div>

                      <p>
                        Pathways decussating in the brainstem, such as the corticospinal tract at the medullary pyramids, account for contralateral motor paresis in hemispheric strokes versus ipsilateral cranial nerve signs in alternating hemiplegia syndromes.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Reader Bottom Navigation */}
              <div className="p-4 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-3.5 py-1.5 rounded-xl bg-[#f5f4f2] dark:bg-[#21262d] text-xs font-bold disabled:opacity-40"
                >
                  <ChevronLeft className="size-4 inline" /> Prev Page
                </button>

                <span className="text-xs font-semibold text-[#77716b]">
                  {Math.round((currentPage / activeReadingBook.page_count) * 100)}% Finished
                </span>

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= activeReadingBook.page_count}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0f4c81] text-white text-xs font-bold disabled:opacity-40"
                >
                  Next Page <ChevronRight className="size-4 inline" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
