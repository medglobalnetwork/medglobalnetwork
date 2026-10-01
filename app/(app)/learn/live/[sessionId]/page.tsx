"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LiveSessionRecord } from "@/modules/learn/lib/live-classroom-db";
import { InstructorLiveRoom } from "@/modules/learn/components/live/InstructorLiveRoom";
import { StudentLiveRoom } from "@/modules/learn/components/live/StudentLiveRoom";
import { Video, Loader2, AlertCircle, Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LiveRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const { data: authSession, isPending: isAuthPending } = authClient.useSession();
  const [liveSession, setLiveSession] = React.useState<LiveSessionRecord | null>(null);
  const [userRole, setUserRole] = React.useState<string>("attendee");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthPending && !authSession) {
      router.replace("/");
    }
  }, [isAuthPending, authSession, router]);

  React.useEffect(() => {
    if (!sessionId || !authSession?.user) return;

    const joinRoom = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/learn/live/sessions/${sessionId}/join`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Unable to join live classroom");
        }

        const data = await res.json();
        setLiveSession(data.session);
        setUserRole(data.role || "attendee");
      } catch (err: any) {
        console.error("Failed to join live session:", err);
        setError(err.message || "Failed to load live classroom session");
      } finally {
        setIsLoading(false);
      }
    };

    joinRoom();
  }, [sessionId, authSession?.user]);

  if (isAuthPending || isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[#0d1117] text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-[#58a6ff]" />
          <p className="text-xs font-semibold text-[#8b949e]">Connecting to live classroom...</p>
        </div>
      </div>
    );
  }

  if (error || !liveSession) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[#0d1117] p-4 text-slate-100">
        <div className="flex w-full max-w-md flex-col items-center rounded-3xl bg-[#161b22] border border-[#30363d] p-8 text-center shadow-2xl">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-500 mb-3">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">Classroom Unavailable</h2>
          <p className="mt-2 text-xs text-[#8b949e]">
            {error || "The requested live session could not be found or has concluded."}
          </p>
          <Link
            href="/learn"
            className="mt-6 flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            <span>Return to Learn</span>
          </Link>
        </div>
      </div>
    );
  }

  const isInstructor =
    authSession?.user?.id === liveSession.instructor_id ||
    userRole === "host" ||
    userRole === "co_host";

  if (isInstructor) {
    return (
      <InstructorLiveRoom
        session={liveSession}
        currentUser={{
          id: authSession?.user?.id || "",
          name: authSession?.user?.name || "Faculty",
          email: authSession?.user?.email || "",
          image: authSession?.user?.image,
        }}
      />
    );
  }

  return (
    <StudentLiveRoom
      session={liveSession}
      currentUser={{
        id: authSession?.user?.id || "",
        name: authSession?.user?.name || "Student",
        email: authSession?.user?.email || "",
        image: authSession?.user?.image,
      }}
    />
  );
}
