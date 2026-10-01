// app/api/learn/ai/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AskAIMessage, AskAIContext } from "@/modules/learn/types";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt, actionType = "general", context = {} } = body as {
      prompt: string;
      actionType?: "explanation" | "notes" | "quiz" | "case_reasoning" | "general";
      context?: AskAIContext;
    };

    if (!prompt?.trim()) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const topic = context.lessonTitle || context.courseTitle || prompt;
    let reply = "";
    let quizPayload: any = undefined;

    switch (actionType) {
      case "explanation":
        reply = `### 🩺 Clinical Breakdown: ${topic}

**1. Core Pathophysiological Concept:**
${topic} involves essential clinical mechanisms that dictate diagnostic and treatment pathways. In clinical practice, recognizing the early physiological markers and differentiating benign vs high-risk presentations is paramount.

**2. Key Diagnostic Milestones:**
- **Primary Workup:** Baseline evaluations, targeted imaging, or electrophysiological assessment.
- **Red Flag Signs:** Any rapid hemodynamic instability, focal neurological deficits, or refractory symptoms warrant immediate escalation.

**3. Evidence-Based Practice Points:**
- Always correlate objective clinical findings with the patient's individual comorbidities.
- Reassess post-intervention response within standardized monitoring windows.`;
        break;

      case "notes":
        reply = `### 📝 High-Yield Revision Notes: ${topic}

- ⚡ **Primary Objective:** Recognize, diagnose, and execute first-line clinical management for ${topic}.
- 🔬 **Essential Criteria:**
  - Gold standard diagnostic approach and initial laboratory/imaging panels.
  - Stratification of low vs. high-risk patient cohorts.
- 💊 **Therapeutic Hierarchy:**
  - **First-line:** Evidence-based medical management and stabilization.
  - **Second-line / Adjunctive:** Targeted procedural, pharmacological, or rehabilitative interventions.
- ⚠️ **Key Pitfalls to Avoid:**
  - Overlooking subtle atypical presentations in elderly, diabetic, or immunocompromised individuals.
  - Delaying definitive intervention while waiting for secondary test results.`;
        break;

      case "quiz":
        reply = `Here is an active recall clinical scenario on **${topic}**:`;
        quizPayload = {
          question: `In a patient presenting with acute clinical findings related to ${topic}, which of the following represents the most appropriate initial priority action?`,
          options: [
            "Initiate immediate hemodynamic stabilization and baseline targeted evaluation",
            "Discharge with oral analgesics and outpatient follow-up in 4 weeks",
            "Perform elective advanced imaging prior to checking vital signs",
            "Withhold all therapeutic interventions until specialized tertiary consultation",
          ],
          correctIndex: 0,
          explanation:
            "Immediate hemodynamic stabilization and baseline targeted evaluation must precede non-urgent imaging or delayed consultation in any acute clinical scenario.",
        };
        break;

      case "case_reasoning":
        reply = `### 🧠 Clinical Case Reasoning & Differential: ${topic}

**1. Primary Working Differential:**
- **Top Consideration:** Primary manifestation related to ${topic}.
- **Rule-Out Competitors:** Mimics presenting with overlapping acute or subacute symptom complexes.

**2. Algorithmic Diagnostic Strategy:**
1. **Initial Assessment:** ABCDE stabilization and targeted organ-system review.
2. **Confirmatory Workup:** Directed biomarkers, imaging, and functional testing.
3. **Risk Stratification:** Utilizing validated clinical scorecards (e.g. Wells, TIMI, NEWS2).

**3. Actionable Clinical Decision:**
Initiate guideline-directed protocol while closely monitoring for treatment response or complications.`;
        break;

      default:
        reply = `Regarding **${topic}**: In medical practice and clinical education, this topic requires strict adherence to standardized clinical guidelines, multidisciplinary collaboration, and continuous evidence appraisal. 

Feel free to ask for specific clarifications, high-yield summary notes, active recall MCQs, or differential diagnosis algorithms!`;
        break;
    }

    const message: AskAIMessage = {
      id: "msg-" + Date.now(),
      role: "assistant",
      content: reply,
      timestamp: new Date().toISOString(),
      action_type: actionType,
      quiz_payload: quizPayload,
    };

    return Response.json({ message });
  } catch (err: any) {
    console.error("POST /api/learn/ai error:", err);
    return Response.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
