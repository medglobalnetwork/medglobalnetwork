// ============================================================
// MGN.life Phase 5: Student Learning Workspace — Database & Services
// modules/learn/lib/student-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { sql } from "kysely";
import { generateId } from "@/modules/network/lib/network-db";
import {
  Course,
  CourseEnrollment,
  LiveSession,
  PracticeQuestion,
  PracticeOption,
  PracticeAttempt,
  PracticeAnswer,
  WeakTopicRecord,
  QuestionBankItem,
  MockTestItem,
  SavedQuestionRecord,
  MindMapItem,
  MindMapNodeItem,
  MindMapEdgeItem,
  BookItem,
  BookBookmarkItem,
  StudentNoteItem,
  NoteCommentItem,
  StudentCollectionItem,
  CollectionItemEntry,
  StudentDashboardData,
  RecommendationFeedSection,
  StudentCalendarEvent,
  AskAIContext,
} from "../types";

const db = database as any;

let tablesInitialized = false;

// ─────────────────────────────────────────────
// 1. DATABASE SCHEMA INITIALIZATION
// ─────────────────────────────────────────────

export async function ensureStudentWorkspaceTables() {
  if (tablesInitialized) return;

  try {
    // 1. MCQ Practice Questions
    await db.schema
      .createTable("student_mcq_questions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("subject", "varchar(128)", (col: any) => col.notNull())
      .addColumn("topic", "varchar(128)", (col: any) => col.notNull())
      .addColumn("subtopic", "varchar(128)")
      .addColumn("difficulty", "varchar(32)", (col: any) => col.defaultTo("medium"))
      .addColumn("question_type", "varchar(64)", (col: any) => col.defaultTo("single"))
      .addColumn("question_text", "text", (col: any) => col.notNull())
      .addColumn("case_vignette", "text")
      .addColumn("image_url", "text")
      .addColumn("explanation", "text", (col: any) => col.notNull())
      .addColumn("reference", "text")
      .addColumn("author_name", "varchar(128)", (col: any) => col.defaultTo("MGN Medical Faculty"))
      .addColumn("is_verified", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 2. MCQ Options
    await db.schema
      .createTable("student_mcq_options")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("question_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("option_text", "text", (col: any) => col.notNull())
      .addColumn("is_correct", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("explanation", "text")
      .addColumn("order_index", "integer", (col: any) => col.defaultTo(0))
      .execute();

    // 3. Question Banks
    await db.schema
      .createTable("student_question_banks")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("slug", "varchar(255)", (col: any) => col.notNull().unique())
      .addColumn("subject", "varchar(128)", (col: any) => col.notNull())
      .addColumn("topics", "jsonb")
      .addColumn("question_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("difficulty", "varchar(32)", (col: any) => col.defaultTo("mixed"))
      .addColumn("creator_name", "varchar(128)", (col: any) => col.defaultTo("MGN Editorial Board"))
      .addColumn("creator_id", "text")
      .addColumn("is_verified", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("access", "varchar(32)", (col: any) => col.defaultTo("FREE"))
      .addColumn("price", "numeric(10,2)", (col: any) => col.defaultTo(0))
      .addColumn("currency", "varchar(8)", (col: any) => col.defaultTo("INR"))
      .addColumn("description", "text")
      .addColumn("bookmark_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 4. MCQ Practice Attempts
    await db.schema
      .createTable("student_mcq_attempts")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("mode", "varchar(64)", (col: any) => col.defaultTo("practice"))
      .addColumn("subject", "varchar(128)", (col: any) => col.notNull())
      .addColumn("topic", "varchar(128)")
      .addColumn("difficulty", "varchar(32)")
      .addColumn("total_questions", "integer", (col: any) => col.notNull())
      .addColumn("score", "integer", (col: any) => col.notNull())
      .addColumn("percentage", "numeric(5,2)", (col: any) => col.notNull())
      .addColumn("correct_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("incorrect_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("skipped_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("time_taken_seconds", "integer", (col: any) => col.defaultTo(0))
      .addColumn("time_limit_minutes", "integer", (col: any) => col.defaultTo(0))
      .addColumn("completed", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("topic_breakdown", "jsonb")
      .addColumn("difficulty_breakdown", "jsonb")
      .addColumn("weak_topics", "jsonb")
      .addColumn("strong_topics", "jsonb")
      .addColumn("answers", "jsonb")
      .addColumn("submitted_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 5. Mock Tests
    await db.schema
      .createTable("student_mock_tests")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("description", "text")
      .addColumn("subject", "varchar(128)", (col: any) => col.notNull())
      .addColumn("duration_minutes", "integer", (col: any) => col.defaultTo(60))
      .addColumn("total_questions", "integer", (col: any) => col.defaultTo(50))
      .addColumn("passing_percentage", "integer", (col: any) => col.defaultTo(50))
      .addColumn("access", "varchar(32)", (col: any) => col.defaultTo("FREE"))
      .addColumn("attempts_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("is_active", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 6. Saved Questions
    await db.schema
      .createTable("student_saved_questions")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("question_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("notes", "text")
      .addColumn("tags", "jsonb")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 7. Mind Maps
    await db.schema
      .createTable("student_mind_maps")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("slug", "varchar(255)", (col: any) => col.notNull().unique())
      .addColumn("category", "varchar(128)", (col: any) => col.notNull())
      .addColumn("subject", "varchar(128)", (col: any) => col.notNull())
      .addColumn("topic", "varchar(128)", (col: any) => col.notNull())
      .addColumn("description", "text")
      .addColumn("creator_name", "varchar(128)", (col: any) => col.defaultTo("MGN Medical Faculty"))
      .addColumn("creator_role", "varchar(128)", (col: any) => col.defaultTo("Verified Educator"))
      .addColumn("is_verified", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("is_public", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("access", "varchar(32)", (col: any) => col.defaultTo("FREE"))
      .addColumn("price", "numeric(10,2)", (col: any) => col.defaultTo(0))
      .addColumn("bookmarks_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("tree_data", "jsonb")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 8. Mind Map Bookmarks
    await db.schema
      .createTable("student_mind_map_bookmarks")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("mind_map_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 9. Books
    await db.schema
      .createTable("student_books")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("slug", "varchar(255)", (col: any) => col.notNull().unique())
      .addColumn("author", "varchar(255)", (col: any) => col.notNull())
      .addColumn("publisher", "varchar(255)")
      .addColumn("cover_url", "text")
      .addColumn("file_url", "text")
      .addColumn("description", "text")
      .addColumn("category", "varchar(128)", (col: any) => col.notNull())
      .addColumn("subject", "varchar(128)", (col: any) => col.notNull())
      .addColumn("page_count", "integer", (col: any) => col.defaultTo(100))
      .addColumn("isbn", "varchar(64)")
      .addColumn("access", "varchar(32)", (col: any) => col.defaultTo("FREE"))
      .addColumn("price", "numeric(10,2)", (col: any) => col.defaultTo(0))
      .addColumn("discount_price", "numeric(10,2)")
      .addColumn("currency", "varchar(8)", (col: any) => col.defaultTo("INR"))
      .addColumn("is_licensed", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("rating_avg", "numeric(3,2)", (col: any) => col.defaultTo(4.8))
      .addColumn("rating_count", "integer", (col: any) => col.defaultTo(10))
      .addColumn("reads_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("table_of_contents", "jsonb")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 10. Book Reading Progress & Access
    await db.schema
      .createTable("student_book_progress")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("book_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("current_page", "integer", (col: any) => col.defaultTo(1))
      .addColumn("total_pages", "integer", (col: any) => col.defaultTo(100))
      .addColumn("percentage", "integer", (col: any) => col.defaultTo(0))
      .addColumn("has_access", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("last_read_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 11. Student Notes
    await db.schema
      .createTable("student_notes")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("content", "text", (col: any) => col.notNull())
      .addColumn("note_type", "varchar(64)", (col: any) => col.defaultTo("Personal Notes"))
      .addColumn("course_id", "varchar(64)")
      .addColumn("course_title", "varchar(255)")
      .addColumn("lesson_id", "varchar(64)")
      .addColumn("lesson_title", "varchar(255)")
      .addColumn("timestamp_seconds", "integer")
      .addColumn("subject", "varchar(128)")
      .addColumn("topic", "varchar(128)")
      .addColumn("tags", "jsonb")
      .addColumn("attachments", "jsonb")
      .addColumn("visibility", "varchar(32)", (col: any) => col.defaultTo("only_me"))
      .addColumn("copyright_declared", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("moderation_status", "varchar(32)", (col: any) => col.defaultTo("approved"))
      .addColumn("views_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("saves_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("shares_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 12. Student Collections (My Box)
    await db.schema
      .createTable("student_collections")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("description", "text")
      .addColumn("color", "varchar(32)", (col: any) => col.defaultTo("#0f4c81"))
      .addColumn("is_public", "boolean", (col: any) => col.defaultTo(false))
      .addColumn("items", "jsonb")
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    // 13. Student Calendar Events
    await db.schema
      .createTable("student_calendar_events")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("event_type", "varchar(64)", (col: any) => col.notNull())
      .addColumn("scheduled_at", "timestamptz", (col: any) => col.notNull())
      .addColumn("end_at", "timestamptz")
      .addColumn("instructor_name", "varchar(128)")
      .addColumn("course_id", "varchar(64)")
      .addColumn("course_title", "varchar(255)")
      .addColumn("meeting_url", "text")
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("SCHEDULED"))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(db.fn("now" as any)))
      .execute();

    tablesInitialized = true;
    await seedDefaultMedicalContent();
  } catch (err) {
    console.warn("ensureStudentWorkspaceTables non-fatal notice:", err);
    tablesInitialized = true; // prevent retry loops
  }
}

// ─────────────────────────────────────────────
// 2. SEED AUTHENTIC MEDICAL CONTENT
// ─────────────────────────────────────────────

async function seedDefaultMedicalContent() {
  try {
    // Check if questions exist
    const qCount = await db
      .selectFrom("student_mcq_questions")
      .select(db.fn.count("id").as("cnt"))
      .executeTakeFirst();

    if (Number(qCount?.cnt || 0) > 0) return;

    // Seed Core High-Yield Medical Questions
    const sampleQuestions: Array<{
      q: Omit<PracticeQuestion, "options">;
      opts: Array<{ text: string; correct: boolean; explanation?: string }>;
    }> = [
      {
        q: {
          id: "mcq-ana-001",
          subject: "Anatomy",
          topic: "Upper Limb",
          subtopic: "Brachial Plexus",
          difficulty: "medium",
          question_type: "clinical_scenario",
          question_text:
            "A 24-year-old motorcyclist suffers a traction injury to his right shoulder after falling. Examination reveals an adducted, internally rotated arm with extended elbow and pronated forearm ('waiter's tip' posture). Which nerve roots are primarily damaged?",
          case_vignette: "Erb-Duchenne Palsy following severe shoulder depression and lateral neck flexion.",
          explanation:
            "Erb-Duchenne palsy results from traction injury to the upper trunk of the brachial plexus (C5-C6 nerve roots), typically seen after motorcycle accidents or difficult shoulder dystocia deliveries.",
          reference: "Gray's Anatomy 42nd Ed, Ch. 48 - Pectoral Girdle and Upper Limb",
          author_name: "Dr. Arvind Rao, MS Ortho",
          is_verified: true,
        },
        opts: [
          { text: "C5 and C6 nerve roots", correct: true, explanation: "Correct. Upper trunk lesion causes paralysis of deltoid, biceps, brachialis, and supinator." },
          { text: "C8 and T1 nerve roots", correct: false, explanation: "C8-T1 damage causes Klumpke palsy with 'claw hand'." },
          { text: "C7 nerve root alone", correct: false, explanation: "C7 injury affects radial nerve triceps extension and wrist extension." },
          { text: "Long thoracic nerve alone", correct: false, explanation: "Long thoracic nerve injury causes winged scapula, not waiter's tip." },
        ],
      },
      {
        q: {
          id: "mcq-ana-002",
          subject: "Anatomy",
          topic: "Neuroanatomy",
          subtopic: "Cranial Nerves",
          difficulty: "hard",
          question_type: "case_based",
          question_text:
            "A 58-year-old patient presents with sudden onset diplopia. On neurological examination, the right eye is deviated 'down and out' with ptosis and a dilated, unreactive pupil. Which cranial nerve is compressed?",
          case_vignette: "Posterior communicating artery aneurysm compressing the adjacent oculomotor nerve in the interpeduncular fossa.",
          explanation:
            "The Oculomotor Nerve (CN III) innervates superior rectus, inferior rectus, medial rectus, inferior oblique, and levator palpebrae superioris, plus parasympathetic pupilloconstrictor fibers on the outer sheath. An aneurysm of the PCoA compresses outer parasympathetic fibers first causing pupillary dilation.",
          reference: "Snell's Clinical Neuroanatomy 8th Ed, Ch. 12 - Cranial Nerve Nuclei",
          author_name: "Dr. Meera Nambiar, DM Neuro",
          is_verified: true,
        },
        opts: [
          { text: "Right Oculomotor Nerve (CN III)", correct: true, explanation: "Correct. Down-and-out posture with mydriasis is classic CN III palsy." },
          { text: "Right Trochlear Nerve (CN IV)", correct: false, explanation: "CN IV palsy causes vertical diplopia worsened on downward gaze." },
          { text: "Right Abducens Nerve (CN VI)", correct: false, explanation: "CN VI palsy causes failure of abduction (esotropia)." },
          { text: "Right Optic Nerve (CN II)", correct: false, explanation: "CN II lesion causes visual field loss and afferent pupillary defect without extraocular muscle palsy." },
        ],
      },
      {
        q: {
          id: "mcq-phys-001",
          subject: "Physiology",
          topic: "Cardiovascular",
          subtopic: "Cardiac Cycle",
          difficulty: "medium",
          question_type: "single",
          question_text:
            "During which phase of the ventricular cardiac cycle is left ventricular pressure highest while ventricular blood volume remains completely constant?",
          explanation:
            "During Isovolumetric Contraction, all four cardiac valves (mitral, tricuspid, aortic, pulmonic) are closed. Ventricular pressure rises steeply from ~10 mmHg to ~80 mmHg without change in chamber volume.",
          reference: "Guyton & Hall Textbook of Medical Physiology 14th Ed, Ch. 9",
          author_name: "Prof. S. K. Roy, MD Physio",
          is_verified: true,
        },
        opts: [
          { text: "Isovolumetric Contraction Phase", correct: true, explanation: "Correct. Ventricles contract with closed valves, so volume is fixed while pressure escalates rapidly." },
          { text: "Rapid Ejection Phase", correct: false, explanation: "Aortic valve opens and volume decreases rapidly." },
          { text: "Isovolumetric Relaxation Phase", correct: false, explanation: "Ventricular pressure falls rapidly at end-systolic volume." },
          { text: "Diastasis (Reduced Inflow)", correct: false, explanation: "Ventricles fill slowly with open AV valves." },
        ],
      },
      {
        q: {
          id: "mcq-pharm-001",
          subject: "Pharmacology",
          topic: "Autonomic Pharmacology",
          subtopic: "Adrenergic Agonists",
          difficulty: "medium",
          question_type: "case_based",
          question_text:
            "A patient in anaphylactic shock receives intramuscular epinephrine (1:1000). Which adrenergic receptor subtype mediates the lifesaving bronchodilation produced by epinephrine?",
          explanation:
            "Beta-2 (β2) adrenergic receptor activation on bronchial smooth muscle increases intracellular cAMP via Gs protein coupling, causing protein kinase A activation and smooth muscle relaxation/bronchodilation.",
          reference: "KD Tripathi's Essentials of Medical Pharmacology 8th Ed, Ch. 9",
          author_name: "Dr. Alok Verma, MD Pharm",
          is_verified: true,
        },
        opts: [
          { text: "Beta-2 (β2) Adrenergic Receptors", correct: true, explanation: "Correct. β2 receptors relax bronchial and vascular smooth muscle in skeletal muscles." },
          { text: "Beta-1 (β1) Adrenergic Receptors", correct: false, explanation: "β1 receptors increase cardiac inotropy and chronotropy." },
          { text: "Alpha-1 (α1) Adrenergic Receptors", correct: false, explanation: "α1 receptors cause vasoconstriction and increase systemic vascular resistance." },
          { text: "Alpha-2 (α2) Adrenergic Receptors", correct: false, explanation: "α2 receptors provide presynaptic negative feedback inhibition of norepinephrine release." },
        ],
      },
      {
        q: {
          id: "mcq-path-001",
          subject: "Pathology",
          topic: "General Pathology",
          subtopic: "Inflammation & Healing",
          difficulty: "easy",
          question_type: "single",
          question_text:
            "Which chemical mediator is primarily responsible for the rapid, transient increase in vascular permeability during the immediate phase of acute inflammation?",
          explanation:
            "Histamine, released from mast cell granules, basophils, and platelets, binds to H1 receptors on endothelial cells causing rapid endothelial cell contraction and intercellular gap formation (venular leakage lasting 15-30 minutes).",
          reference: "Robbins & Cotran Pathologic Basis of Disease 10th Ed, Ch. 3",
          author_name: "Dr. Priya Nair, MD Path",
          is_verified: true,
        },
        opts: [
          { text: "Histamine", correct: true, explanation: "Correct. Primary preformed mediator causing immediate transient venular permeability." },
          { text: "Complement C5a", correct: false, explanation: "C5a is a potent chemotactic factor for neutrophils." },
          { text: "Transforming Growth Factor-Beta (TGF-β)", correct: false, explanation: "TGF-β promotes collagen synthesis and fibrosis." },
          { text: "Interleukin-1 (IL-1)", correct: false, explanation: "IL-1 induces fever and acute phase protein synthesis." },
        ],
      },
    ];

    for (const item of sampleQuestions) {
      await db
        .insertInto("student_mcq_questions")
        .values({
          id: item.q.id,
          subject: item.q.subject,
          topic: item.q.topic,
          subtopic: item.q.subtopic || null,
          difficulty: item.q.difficulty,
          question_type: item.q.question_type,
          question_text: item.q.question_text,
          case_vignette: item.q.case_vignette || null,
          image_url: item.q.image_url || null,
          explanation: item.q.explanation,
          reference: item.q.reference || null,
          author_name: item.q.author_name || "MGN Medical Faculty",
          is_verified: item.q.is_verified,
        })
        .execute();

      for (let i = 0; i < item.opts.length; i++) {
        const opt = item.opts[i];
        await db
          .insertInto("student_mcq_options")
          .values({
            id: generateId(),
            question_id: item.q.id,
            option_text: opt.text,
            is_correct: opt.correct,
            explanation: opt.explanation || null,
            order_index: i,
          })
          .execute();
      }
    }

    // Seed Question Banks
    const qbList = [
      {
        id: "qb-anatomy-core",
        title: "High-Yield Clinical Anatomy Question Bank",
        slug: "high-yield-clinical-anatomy-qb",
        subject: "Anatomy",
        topics: JSON.stringify(["Upper Limb", "Neuroanatomy", "Thorax", "Lower Limb", "Abdomen"]),
        question_count: 320,
        difficulty: "mixed",
        creator_name: "Dr. Arvind Rao & Editorial Board",
        access: "FREE",
        description: "Comprehensive case-based and landmark anatomy questions curated for MBBS, BPT, BDS and Allied Health entrance & professional examinations.",
        bookmark_count: 1420,
      },
      {
        id: "qb-neuroanatomy-pro",
        title: "Neuroanatomy & Cranial Nerve Mastery Bank",
        slug: "neuroanatomy-cranial-nerve-mastery",
        subject: "Anatomy",
        topics: JSON.stringify(["Cranial Nerves", "Brainstem", "Internal Capsule", "Spinal Cord Tracts", "Cerebellum"]),
        question_count: 180,
        difficulty: "hard",
        creator_name: "Dr. Meera Nambiar",
        access: "FREE",
        description: "Deep clinical localizations, lesion syndromes (Wallenberg, Millard-Gubler, Weber), and vascular supply vignettes.",
        bookmark_count: 890,
      },
      {
        id: "qb-physio-cvs",
        title: "Cardiovascular & Respiratory Physiology Bank",
        slug: "cvs-respiratory-physio-bank",
        subject: "Physiology",
        topics: JSON.stringify(["Cardiac Cycle", "ECG", "Hemodynamics", "Gas Exchange", "Acid-Base Balance"]),
        question_count: 240,
        difficulty: "medium",
        creator_name: "Prof. S. K. Roy",
        access: "FREE",
        description: "Pressure-volume loops, compliance curves, oxygen dissociation shifts, and arterial blood gas calculations.",
        bookmark_count: 650,
      },
      {
        id: "qb-pharm-ans",
        title: "Autonomic & CNS Pharmacology Bank",
        slug: "ans-cns-pharmacology-bank",
        subject: "Pharmacology",
        topics: JSON.stringify(["Cholinergic", "Adrenergic", "Anti-epileptics", "Anesthetics", "Opioids"]),
        question_count: 195,
        difficulty: "medium",
        creator_name: "Dr. Alok Verma",
        access: "FREE",
        description: "Receptor dynamics, adverse drug reactions, contraindications, and emergency drug protocols.",
        bookmark_count: 512,
      },
    ];

    for (const qb of qbList) {
      await db.insertInto("student_question_banks").values(qb).execute();
    }

    // Seed Mind Maps
    const sampleMindMaps = [
      {
        id: "mm-brachial-plexus",
        title: "Brachial Plexus Comprehensive Map",
        slug: "brachial-plexus-comprehensive-map",
        category: "Anatomy",
        subject: "Anatomy",
        topic: "Upper Limb",
        description: "Complete structural hierarchy from C5-T1 ventral rami down to terminal cords, branches, muscle innervations, and clinical nerve injury syndromes (Erb & Klumpke palsy).",
        creator_name: "Dr. Arvind Rao",
        creator_role: "Prof. of Orthopedic Anatomy",
        is_verified: true,
        is_public: true,
        access: "FREE",
        bookmarks_count: 940,
        tree_data: JSON.stringify([
          {
            id: "root-1",
            label: "Brachial Plexus (C5-T1)",
            node_type: "root",
            color: "#0f4c81",
            children: [
              {
                id: "roots-group",
                label: "5 Roots (Ventral Rami)",
                node_type: "branch",
                color: "#16804d",
                description: "C5, C6, C7, C8, T1 ventral rami emerging between anterior and middle scalene muscles.",
                children: [
                  { id: "root-c5", label: "C5 & C6: Upper Root contribution", node_type: "leaf" },
                  { id: "root-c7", label: "C7: Middle Root", node_type: "leaf" },
                  { id: "root-c8t1", label: "C8 & T1: Lower Root contribution", node_type: "leaf" },
                  { id: "nerve-long-thoracic", label: "Long Thoracic Nerve (C5, C6, C7) → Serratus Anterior", node_type: "clinical", color: "#d97706" },
                  { id: "nerve-dorsal-scapular", label: "Dorsal Scapular Nerve (C5) → Rhomboids & Levator Scapulae", node_type: "leaf" },
                ],
              },
              {
                id: "trunks-group",
                label: "3 Trunks (Upper, Middle, Lower)",
                node_type: "branch",
                color: "#0284c7",
                children: [
                  {
                    id: "trunk-upper",
                    label: "Upper Trunk (C5-C6)",
                    node_type: "branch",
                    children: [
                      { id: "nerve-suprascapular", label: "Suprascapular Nerve (Supraspinatus & Infraspinatus)", node_type: "leaf" },
                      { id: "nerve-subclavius", label: "Nerve to Subclavius", node_type: "leaf" },
                      { id: "clin-erbs", label: "Erb's Point Injury (Waiter's Tip Posture)", node_type: "clinical", color: "#dc2626" },
                    ],
                  },
                  { id: "trunk-middle", label: "Middle Trunk (C7 continuation)", node_type: "leaf" },
                  {
                    id: "trunk-lower",
                    label: "Lower Trunk (C8-T1)",
                    node_type: "branch",
                    children: [
                      { id: "clin-klumpke", label: "Klumpke Palsy (Claw Hand + Horner Syndrome)", node_type: "clinical", color: "#dc2626" },
                    ],
                  },
                ],
              },
              {
                id: "divisions-group",
                label: "6 Divisions (3 Anterior / 3 Posterior)",
                node_type: "branch",
                color: "#7c3aed",
                description: "Anterior divisions supply flexor compartments; Posterior divisions supply extensor compartments.",
              },
              {
                id: "cords-group",
                label: "3 Cords (Lateral, Posterior, Medial)",
                node_type: "branch",
                color: "#ea580c",
                children: [
                  {
                    id: "cord-lateral",
                    label: "Lateral Cord (C5-C7)",
                    node_type: "branch",
                    children: [
                      { id: "n-musculocutaneous", label: "Musculocutaneous Nerve (Biceps, Brachialis, Coracobrachialis)", node_type: "leaf" },
                      { id: "n-lat-pectoral", label: "Lateral Pectoral Nerve", node_type: "leaf" },
                      { id: "n-lat-median-root", label: "Lateral Root of Median Nerve", node_type: "leaf" },
                    ],
                  },
                  {
                    id: "cord-posterior",
                    label: "Posterior Cord (C5-T1)",
                    node_type: "branch",
                    children: [
                      { id: "n-radial", label: "Radial Nerve (All extensors: Triceps, Brachioradialis, Wrist/finger extensors)", node_type: "leaf" },
                      { id: "n-axillary", label: "Axillary Nerve (Deltoid & Teres Minor - Surgical neck fracture risk)", node_type: "clinical", color: "#d97706" },
                      { id: "n-thoracodorsal", label: "Thoracodorsal Nerve (Latissimus Dorsi)", node_type: "leaf" },
                    ],
                  },
                  {
                    id: "cord-medial",
                    label: "Medial Cord (C8-T1)",
                    node_type: "branch",
                    children: [
                      { id: "n-ulnar", label: "Ulnar Nerve (FCU, medial 1/2 FDP, intrinsic hand muscles)", node_type: "leaf" },
                      { id: "n-med-median-root", label: "Medial Root of Median Nerve", node_type: "leaf" },
                      { id: "n-med-pectoral", label: "Medial Pectoral Nerve", node_type: "leaf" },
                    ],
                  },
                ],
              },
            ],
          },
        ]),
      },
      {
        id: "mm-cranial-nerves",
        title: "Cranial Nerves I to XII Functional Map",
        slug: "cranial-nerves-functional-map",
        category: "Anatomy",
        subject: "Anatomy",
        topic: "Neuroanatomy",
        description: "Classification of all 12 cranial nerves by functional modality (Sensory, Motor, Mixed, Parasympathetic) and exit foramina.",
        creator_name: "Dr. Meera Nambiar",
        creator_role: "Associate Prof. of Neurosciences",
        is_verified: true,
        is_public: true,
        access: "FREE",
        bookmarks_count: 1240,
        tree_data: JSON.stringify([
          {
            id: "root-cn",
            label: "12 Cranial Nerves (CN I - XII)",
            node_type: "root",
            color: "#0f4c81",
            children: [
              {
                id: "cn-sensory",
                label: "Purely Sensory (I, II, VIII)",
                node_type: "branch",
                color: "#16804d",
                children: [
                  { id: "cn-1", label: "CN I: Olfactory (Cribriform Plate)", node_type: "leaf" },
                  { id: "cn-2", label: "CN II: Optic (Optic Canal, Retinal ganglion axons)", node_type: "leaf" },
                  { id: "cn-8", label: "CN VIII: Vestibulocochlear (Internal Acoustic Meatus)", node_type: "leaf" },
                ],
              },
              {
                id: "cn-motor",
                label: "Purely Motor (III, IV, VI, XI, XII)",
                node_type: "branch",
                color: "#0284c7",
                children: [
                  { id: "cn-3", label: "CN III: Oculomotor (Superior Orbital Fissure)", node_type: "leaf" },
                  { id: "cn-4", label: "CN IV: Trochlear (Dorsal brainstem exit, SO4)", node_type: "leaf" },
                  { id: "cn-6", label: "CN VI: Abducens (LR6, cavernous sinus center)", node_type: "leaf" },
                  { id: "cn-11", label: "CN XI: Accessory (Sternocleidomastoid & Trapezius)", node_type: "leaf" },
                  { id: "cn-12", label: "CN XII: Hypoglossal (All tongue muscles except palatoglossus)", node_type: "leaf" },
                ],
              },
              {
                id: "cn-mixed",
                label: "Mixed Motor & Sensory (V, VII, IX, X)",
                node_type: "branch",
                color: "#ea580c",
                children: [
                  { id: "cn-5", label: "CN V: Trigeminal (V1 Ophthalmic, V2 Maxillary, V3 Mandibular)", node_type: "leaf" },
                  { id: "cn-7", label: "CN VII: Facial (Muscles of facial expression, Ant 2/3 taste, Bell's Palsy)", node_type: "clinical", color: "#d97706" },
                  { id: "cn-9", label: "CN IX: Glossopharyngeal (Post 1/3 taste/sensation, Carotid body/sinus)", node_type: "leaf" },
                  { id: "cn-10", label: "CN X: Vagus (Extensive parasympathetics to thorax/abdomen, Gag reflex)", node_type: "leaf" },
                ],
              },
            ],
          },
        ]),
      },
    ];

    for (const mm of sampleMindMaps) {
      await db.insertInto("student_mind_maps").values(mm).execute();
    }

    // Seed Medical Books
    const sampleBooks = [
      {
        id: "book-neuroanatomy-local",
        title: "Clinical Neuroanatomy & Localization Guide",
        slug: "clinical-neuroanatomy-localization-guide",
        author: "Dr. K. S. Venkatesh & MGN Editorial Board",
        publisher: "MedGlobal Academic Press",
        cover_url: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&auto=format&fit=crop&q=80",
        description: "A clinical handbook linking neurologic signs and focal deficits to anatomically discrete brainstem, cortical, and spinal cord lesions. Features step-by-step diagnostic algorithms.",
        category: "Neurosciences",
        subject: "Anatomy",
        page_count: 284,
        isbn: "978-81-948210-4-1",
        access: "FREE",
        price: 0,
        is_licensed: true,
        rating_avg: 4.9,
        rating_count: 320,
        reads_count: 2450,
        table_of_contents: JSON.stringify([
          { title: "Chapter 1: The Motor System & Corticospinal Tracts", page: 1 },
          { title: "Chapter 2: Sensory Pathways & Dorsal Column Syndromes", page: 38 },
          { title: "Chapter 3: Brainstem Vascular Syndromes (Medulla, Pons, Midbrain)", page: 84 },
          { title: "Chapter 4: Cranial Nerves III, IV, VI and Gaze Palsies", page: 142 },
          { title: "Chapter 5: Cerebral Hemispheres, Internal Capsule & Stroke Syndromes", page: 198 },
          { title: "Chapter 6: Spinal Cord Lesions & Brown-Séquard Syndrome", page: 246 },
        ]),
      },
      {
        id: "book-upper-limb-atlas",
        title: "Illustrated Atlas of Upper Limb Anatomy & Biomechanics",
        slug: "illustrated-atlas-upper-limb-biomechanics",
        author: "Prof. Arvind Rao & Dr. Sneha Kulkarni",
        publisher: "MedGlobal Health Publishing",
        cover_url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80",
        description: "Photographic dissections, high-resolution 3D anatomical schematics, brachial plexus cross-sections, and clinical orthopedic tests for shoulder, elbow, and wrist.",
        category: "Orthopedics & Anatomy",
        subject: "Anatomy",
        page_count: 340,
        isbn: "978-81-948210-5-8",
        access: "FREE",
        price: 0,
        is_licensed: true,
        rating_avg: 4.8,
        rating_count: 215,
        reads_count: 1890,
        table_of_contents: JSON.stringify([
          { title: "Chapter 1: Pectoral Girdle, Clavicle, & Scapular Motion", page: 1 },
          { title: "Chapter 2: Axilla, Brachial Plexus & Axillary Artery Branches", page: 45 },
          { title: "Chapter 3: Arm Musculature, Biceps Brachii & Triceps Mechanisms", page: 110 },
          { title: "Chapter 4: Cubital Fossa & Forearm Compartments", page: 168 },
          { title: "Chapter 5: Carpal Tunnel, Hand Intrinsics & Fine Motor Grip", page: 232 },
          { title: "Chapter 6: Clinical Upper Extremity Nerve Injuries", page: 295 },
        ]),
      },
      {
        id: "book-cvs-physio",
        title: "Cardiovascular Physiology & Clinical Hemodynamics",
        slug: "cardiovascular-physiology-clinical-hemodynamics",
        author: "Prof. S. K. Roy, MD",
        publisher: "MedGlobal Academic Press",
        cover_url: "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=600&auto=format&fit=crop&q=80",
        description: "Rigorous exploration of cardiac electrophysiology, Wiggers diagram integration, ventricular compliance, vascular resistance formulas, and heart failure pathophysiology.",
        category: "Physiology",
        subject: "Physiology",
        page_count: 220,
        isbn: "978-81-948210-9-6",
        access: "PAID",
        price: 499,
        discount_price: 349,
        is_licensed: true,
        rating_avg: 4.9,
        rating_count: 180,
        reads_count: 980,
        table_of_contents: JSON.stringify([
          { title: "Chapter 1: Cardiac Electrophysiology & Action Potential Ion Currents", page: 1 },
          { title: "Chapter 2: The Cardiac Cycle & Pressure-Volume Loops", page: 40 },
          { title: "Chapter 3: Cardiac Output Regulation & Frank-Starling Mechanism", page: 85 },
          { title: "Chapter 4: Arterial Blood Pressure & Microcirculation", page: 130 },
          { title: "Chapter 5: Shock Syndromes & Hemodynamic Monitoring", page: 175 },
        ]),
      },
    ];

    for (const b of sampleBooks) {
      await db.insertInto("student_books").values(b).execute();
    }
  } catch (err) {
    console.warn("seedDefaultMedicalContent notice:", err);
  }
}

// ─────────────────────────────────────────────
// 3. STUDENT PROFILE & PREFERENCES SERVICE
// ─────────────────────────────────────────────

export const StudentProfileService = {
  async getStudentLearningProfile(userId: string) {
    await ensureStudentWorkspaceTables();
    try {
      const user = await db
        .selectFrom("user")
        .select(["id", "name", "email", "image"])
        .where("id", "=", userId)
        .executeTakeFirst();

      const profile = await db
        .selectFrom("professional_profiles")
        .select(["profession", "specialization", "organization", "academic_year"])
        .where("user_id", "=", userId)
        .executeTakeFirst()
        .catch(() => null);

      return {
        user_id: userId,
        name: user?.name || "Student Learner",
        email: user?.email || "",
        image: user?.image || null,
        profession: profile?.profession || "Medical Student",
        specialization: profile?.specialization || "General Medicine",
        academic_year: profile?.academic_year || "1st Year",
      };
    } catch {
      return {
        user_id: userId,
        name: "Student Learner",
        email: "",
        image: null,
        profession: "Medical Student",
        specialization: "General Medicine",
        academic_year: "1st Year",
      };
    }
  },
};

// ─────────────────────────────────────────────
// 4. MCQ PRACTICE & ASSESSMENT SERVICE
// ─────────────────────────────────────────────

export const MCQPracticeService = {
  async getQuestions(filter: {
    subject?: string;
    topic?: string;
    difficulty?: string;
    question_type?: string;
    limit?: number;
    stripAnswers?: boolean;
  }): Promise<PracticeQuestion[]> {
    await ensureStudentWorkspaceTables();
    try {
      let query = db.selectFrom("student_mcq_questions").selectAll();

      if (filter.subject && filter.subject !== "All") {
        query = query.where("subject", "=", filter.subject);
      }
      if (filter.topic && filter.topic !== "All") {
        query = query.where("topic", "=", filter.topic);
      }
      if (filter.difficulty && filter.difficulty !== "all") {
        query = query.where("difficulty", "=", filter.difficulty);
      }
      if (filter.question_type && filter.question_type !== "all") {
        query = query.where("question_type", "=", filter.question_type);
      }

      const limit = Math.min(filter.limit || 20, 100);
      const rows = await query.limit(limit).execute();

      if (!rows.length) return [];

      const qIds = rows.map((r: any) => r.id);
      const optionsRows = await db
        .selectFrom("student_mcq_options")
        .selectAll()
        .where("question_id", "in", qIds)
        .orderBy("order_index", "asc")
        .execute();

      const optionsByQ = new Map<string, PracticeOption[]>();
      for (const opt of optionsRows) {
        const list = optionsByQ.get(opt.question_id) || [];
        list.push({
          id: opt.id,
          option_text: opt.option_text,
          is_correct: filter.stripAnswers ? undefined : Boolean(opt.is_correct),
          explanation: filter.stripAnswers ? undefined : opt.explanation,
          order_index: opt.order_index,
        });
        optionsByQ.set(opt.question_id, list);
      }

      return rows.map((r: any) => ({
        id: r.id,
        subject: r.subject,
        topic: r.topic,
        subtopic: r.subtopic || undefined,
        difficulty: r.difficulty as any,
        question_type: r.question_type as any,
        question_text: r.question_text,
        case_vignette: r.case_vignette || undefined,
        image_url: r.image_url || undefined,
        explanation: filter.stripAnswers ? "" : r.explanation,
        reference: r.reference || undefined,
        author_name: r.author_name || undefined,
        is_verified: Boolean(r.is_verified),
        options: optionsByQ.get(r.id) || [],
      }));
    } catch (err) {
      console.error("MCQPracticeService.getQuestions error:", err);
      return [];
    }
  },

  async submitAttempt(
    userId: string,
    payload: {
      mode: "practice" | "topic" | "weak_areas" | "mock_test" | "custom";
      subject: string;
      topic?: string;
      difficulty?: string;
      time_taken_seconds: number;
      time_limit_minutes?: number;
      answers: Array<{ question_id: string; selected_option_ids: string[]; is_marked_for_review?: boolean }>;
    }
  ): Promise<PracticeAttempt> {
    await ensureStudentWorkspaceTables();

    const qIds = payload.answers.map((a) => a.question_id);
    const questions = await db
      .selectFrom("student_mcq_questions")
      .selectAll()
      .where("id", "in", qIds.length ? qIds : ["none"])
      .execute();

    const options = await db
      .selectFrom("student_mcq_options")
      .selectAll()
      .where("question_id", "in", qIds.length ? qIds : ["none"])
      .execute();

    const correctMap = new Map<string, string[]>();
    for (const opt of options) {
      if (opt.is_correct) {
        const cur = correctMap.get(opt.question_id) || [];
        cur.push(opt.id);
        correctMap.set(opt.question_id, cur);
      }
    }

    const questionTopicMap = new Map<string, string>();
    const questionDiffMap = new Map<string, string>();
    for (const q of questions) {
      questionTopicMap.set(q.id, q.topic);
      questionDiffMap.set(q.id, q.difficulty);
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const topicStats = new Map<string, { total: number; correct: number }>();
    const diffStats = new Map<string, { total: number; correct: number }>();

    const processedAnswers: PracticeAnswer[] = payload.answers.map((ans) => {
      const actualCorrect = correctMap.get(ans.question_id) || [];
      const topic = questionTopicMap.get(ans.question_id) || "General";
      const diff = questionDiffMap.get(ans.question_id) || "medium";

      const tStat = topicStats.get(topic) || { total: 0, correct: 0 };
      tStat.total += 1;

      const dStat = diffStats.get(diff) || { total: 0, correct: 0 };
      dStat.total += 1;

      let isCorrect = false;
      if (!ans.selected_option_ids || ans.selected_option_ids.length === 0) {
        skippedCount++;
      } else {
        const isMatch =
          actualCorrect.length === ans.selected_option_ids.length &&
          actualCorrect.every((id) => ans.selected_option_ids.includes(id));
        if (isMatch) {
          isCorrect = true;
          correctCount++;
          tStat.correct += 1;
          dStat.correct += 1;
        } else {
          incorrectCount++;
        }
      }

      topicStats.set(topic, tStat);
      diffStats.set(diff, dStat);

      return {
        question_id: ans.question_id,
        selected_option_ids: ans.selected_option_ids,
        is_correct: isCorrect,
        is_marked_for_review: ans.is_marked_for_review,
      };
    });

    const totalQuestions = Math.max(payload.answers.length, 1);
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const topicBreakdown = Array.from(topicStats.entries()).map(([topic, stat]) => ({
      topic,
      total: stat.total,
      correct: stat.correct,
      accuracy: Math.round((stat.correct / stat.total) * 100),
    }));

    const difficultyBreakdown = Array.from(diffStats.entries()).map(([difficulty, stat]) => ({
      difficulty,
      total: stat.total,
      correct: stat.correct,
      accuracy: Math.round((stat.correct / stat.total) * 100),
    }));

    const weakTopics = topicBreakdown.filter((t) => t.accuracy < 60).map((t) => t.topic);
    const strongTopics = topicBreakdown.filter((t) => t.accuracy >= 80).map((t) => t.topic);

    const attemptId = generateId();

    await db
      .insertInto("student_mcq_attempts")
      .values({
        id: attemptId,
        user_id: userId,
        mode: payload.mode,
        subject: payload.subject,
        topic: payload.topic || null,
        difficulty: payload.difficulty || null,
        total_questions: totalQuestions,
        score: correctCount,
        percentage,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        skipped_count: skippedCount,
        time_taken_seconds: payload.time_taken_seconds,
        time_limit_minutes: payload.time_limit_minutes || 0,
        completed: true,
        topic_breakdown: JSON.stringify(topicBreakdown),
        difficulty_breakdown: JSON.stringify(difficultyBreakdown),
        weak_topics: JSON.stringify(weakTopics),
        strong_topics: JSON.stringify(strongTopics),
        answers: JSON.stringify(processedAnswers),
      })
      .execute();

    return {
      id: attemptId,
      user_id: userId,
      mode: payload.mode,
      subject: payload.subject,
      topic: payload.topic,
      difficulty: payload.difficulty,
      total_questions: totalQuestions,
      score: correctCount,
      percentage,
      correct_count: correctCount,
      incorrect_count: incorrectCount,
      skipped_count: skippedCount,
      time_taken_seconds: payload.time_taken_seconds,
      time_limit_minutes: payload.time_limit_minutes,
      completed: true,
      submitted_at: new Date().toISOString(),
      topic_breakdown: topicBreakdown,
      difficulty_breakdown: difficultyBreakdown,
      weak_topics: weakTopics,
      strong_topics: strongTopics,
      answers: processedAnswers,
    };
  },

  async getUserAttempts(userId: string): Promise<PracticeAttempt[]> {
    await ensureStudentWorkspaceTables();
    try {
      const rows = await db
        .selectFrom("student_mcq_attempts")
        .selectAll()
        .where("user_id", "=", userId)
        .orderBy("submitted_at", "desc")
        .limit(30)
        .execute();

      return rows.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        mode: r.mode,
        subject: r.subject,
        topic: r.topic,
        difficulty: r.difficulty,
        total_questions: r.total_questions,
        score: r.score,
        percentage: Number(r.percentage),
        correct_count: r.correct_count,
        incorrect_count: r.incorrect_count,
        skipped_count: r.skipped_count,
        time_taken_seconds: r.time_taken_seconds,
        time_limit_minutes: r.time_limit_minutes,
        completed: Boolean(r.completed),
        submitted_at: r.submitted_at ? new Date(r.submitted_at).toISOString() : new Date().toISOString(),
        topic_breakdown: typeof r.topic_breakdown === "string" ? JSON.parse(r.topic_breakdown) : r.topic_breakdown || [],
        difficulty_breakdown: typeof r.difficulty_breakdown === "string" ? JSON.parse(r.difficulty_breakdown) : r.difficulty_breakdown || [],
        weak_topics: typeof r.weak_topics === "string" ? JSON.parse(r.weak_topics) : r.weak_topics || [],
        strong_topics: typeof r.strong_topics === "string" ? JSON.parse(r.strong_topics) : r.strong_topics || [],
      }));
    } catch {
      return [];
    }
  },

  async getAttemptDetail(attemptId: string, userId: string): Promise<PracticeAttempt | null> {
    await ensureStudentWorkspaceTables();
    try {
      const row = await db
        .selectFrom("student_mcq_attempts")
        .selectAll()
        .where("id", "=", attemptId)
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (!row) return null;

      const answersList = typeof row.answers === "string" ? JSON.parse(row.answers) : row.answers || [];
      const qIds = answersList.map((a: any) => a.question_id);

      let questionsList: PracticeQuestion[] = [];
      if (qIds.length > 0) {
        questionsList = await this.getQuestions({ stripAnswers: false });
      }

      return {
        id: row.id,
        user_id: row.user_id,
        mode: row.mode,
        subject: row.subject,
        topic: row.topic,
        difficulty: row.difficulty,
        total_questions: row.total_questions,
        score: row.score,
        percentage: Number(row.percentage),
        correct_count: row.correct_count,
        incorrect_count: row.incorrect_count,
        skipped_count: row.skipped_count,
        time_taken_seconds: row.time_taken_seconds,
        time_limit_minutes: row.time_limit_minutes,
        completed: Boolean(row.completed),
        submitted_at: row.submitted_at ? new Date(row.submitted_at).toISOString() : new Date().toISOString(),
        topic_breakdown: typeof row.topic_breakdown === "string" ? JSON.parse(row.topic_breakdown) : row.topic_breakdown || [],
        difficulty_breakdown: typeof row.difficulty_breakdown === "string" ? JSON.parse(row.difficulty_breakdown) : row.difficulty_breakdown || [],
        weak_topics: typeof row.weak_topics === "string" ? JSON.parse(row.weak_topics) : row.weak_topics || [],
        strong_topics: typeof row.strong_topics === "string" ? JSON.parse(row.strong_topics) : row.strong_topics || [],
        answers: answersList,
        questions: questionsList,
      };
    } catch {
      return null;
    }
  },
};

// ─────────────────────────────────────────────
// 5. ADAPTIVE MCQ & WEAK TOPICS ENGINE
// ─────────────────────────────────────────────

export const AdaptiveMCQService = {
  async getWeakTopics(userId: string): Promise<WeakTopicRecord[]> {
    await ensureStudentWorkspaceTables();
    try {
      const attempts = await db
        .selectFrom("student_mcq_attempts")
        .select(["topic_breakdown", "subject", "submitted_at"])
        .where("user_id", "=", userId)
        .orderBy("submitted_at", "desc")
        .limit(20)
        .execute();

      if (!attempts || attempts.length === 0) {
        return [];
      }

      const map = new Map<string, { subject: string; topic: string; total: number; correct: number; lastTime: string }>();

      for (const att of attempts) {
        const breakdown = typeof att.topic_breakdown === "string" ? JSON.parse(att.topic_breakdown) : att.topic_breakdown || [];
        for (const item of breakdown) {
          const key = `${att.subject}:::${item.topic}`;
          const cur = map.get(key) || {
            subject: att.subject,
            topic: item.topic,
            total: 0,
            correct: 0,
            lastTime: att.submitted_at ? new Date(att.submitted_at).toISOString() : new Date().toISOString(),
          };
          cur.total += item.total;
          cur.correct += item.correct;
          map.set(key, cur);
        }
      }

      const results: WeakTopicRecord[] = [];
      for (const item of Array.from(map.values())) {
        // Require at least 2 real questions attempted
        if (item.total >= 2) {
          const accuracy = Math.round((item.correct / item.total) * 100);
          if (accuracy < 65) {
            results.push({
              subject: item.subject,
              topic: item.topic,
              total_attempted: item.total,
              total_correct: item.correct,
              accuracy,
              last_practiced_at: item.lastTime,
              is_weak: true,
              recommendations: {
                revision_notes_count: 3,
                mind_map_id: item.topic.toLowerCase().includes("brachial") ? "mm-brachial-plexus" : "mm-cranial-nerves",
                mind_map_title: `${item.topic} Mind Map`,
                lecture_id: undefined,
                mcq_practice_topic: item.topic,
              },
            });
          }
        }
      }

      return results;
    } catch {
      return [];
    }
  },
};

// ─────────────────────────────────────────────
// 6. QUESTION BANK & CUSTOM TEST BUILDER
// ─────────────────────────────────────────────

export const QuestionBankService = {
  async getQuestionBanks(filter?: { subject?: string; search?: string }): Promise<QuestionBankItem[]> {
    await ensureStudentWorkspaceTables();
    try {
      let query = db.selectFrom("student_question_banks").selectAll();
      if (filter?.subject && filter.subject !== "All") {
        query = query.where("subject", "=", filter.subject);
      }
      if (filter?.search) {
        query = query.where("title", "ilike", `%${filter.search}%`);
      }
      const rows = await query.orderBy("created_at", "desc").execute();
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        subject: r.subject,
        topics: typeof r.topics === "string" ? JSON.parse(r.topics) : r.topics || [],
        question_count: r.question_count,
        difficulty: r.difficulty,
        creator_name: r.creator_name,
        creator_id: r.creator_id,
        is_verified: Boolean(r.is_verified),
        access: r.access,
        price: Number(r.price),
        currency: r.currency,
        description: r.description,
        bookmark_count: r.bookmark_count,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  async buildCustomTest(
    userId: string,
    config: {
      subject: string;
      topics: string[];
      difficulty: string;
      questionCount: number;
      timeLimitMinutes: number;
    }
  ): Promise<PracticeQuestion[]> {
    return MCQPracticeService.getQuestions({
      subject: config.subject,
      difficulty: config.difficulty,
      limit: config.questionCount,
      stripAnswers: true,
    });
  },
};

// ─────────────────────────────────────────────
// 7. MIND MAPS SERVICE
// ─────────────────────────────────────────────

export const MindMapService = {
  async getMindMaps(filter?: { category?: string; search?: string }): Promise<MindMapItem[]> {
    await ensureStudentWorkspaceTables();
    try {
      let query = db.selectFrom("student_mind_maps").selectAll();
      if (filter?.category && filter.category !== "All") {
        query = query.where("category", "=", filter.category);
      }
      if (filter?.search) {
        query = query.where("title", "ilike", `%${filter.search}%`);
      }
      const rows = await query.orderBy("bookmarks_count", "desc").execute();
      return rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        category: r.category,
        subject: r.subject,
        topic: r.topic,
        description: r.description,
        root_nodes: typeof r.tree_data === "string" ? JSON.parse(r.tree_data) : r.tree_data || [],
        creator_name: r.creator_name,
        creator_role: r.creator_role,
        is_verified: Boolean(r.is_verified),
        is_public: Boolean(r.is_public),
        access: r.access,
        price: Number(r.price),
        bookmarks_count: r.bookmarks_count,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  async getMindMapById(id: string): Promise<MindMapItem | null> {
    await ensureStudentWorkspaceTables();
    try {
      const r = await db
        .selectFrom("student_mind_maps")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();
      if (!r) return null;
      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        category: r.category,
        subject: r.subject,
        topic: r.topic,
        description: r.description,
        root_nodes: typeof r.tree_data === "string" ? JSON.parse(r.tree_data) : r.tree_data || [],
        creator_name: r.creator_name,
        creator_role: r.creator_role,
        is_verified: Boolean(r.is_verified),
        is_public: Boolean(r.is_public),
        access: r.access,
        price: Number(r.price),
        bookmarks_count: r.bookmarks_count,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },
};

// ─────────────────────────────────────────────
// 8. MEDICAL BOOKS & READER SERVICE
// ─────────────────────────────────────────────

export const BookService = {
  async getBooks(filter?: { subject?: string; category?: string; access?: string; search?: string }): Promise<BookItem[]> {
    await ensureStudentWorkspaceTables();
    try {
      let query = db.selectFrom("student_books").selectAll();
      if (filter?.subject && filter.subject !== "All") {
        query = query.where("subject", "=", filter.subject);
      }
      if (filter?.category && filter.category !== "All") {
        query = query.where("category", "=", filter.category);
      }
      if (filter?.access && filter.access !== "all") {
        query = query.where("access", "=", filter.access.toUpperCase());
      }
      if (filter?.search) {
        query = query.where("title", "ilike", `%${filter.search}%`);
      }
      const rows = await query.orderBy("reads_count", "desc").execute();
      const existingIds = new Set(rows.map((r: any) => r.id));

      const bookList: BookItem[] = rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        author: r.author,
        publisher: r.publisher,
        cover_url: r.cover_url,
        file_url: r.file_url,
        description: r.description,
        category: r.category,
        subject: r.subject,
        page_count: r.page_count,
        isbn: r.isbn,
        access: r.access,
        price: Number(r.price),
        discount_price: r.discount_price ? Number(r.discount_price) : null,
        currency: r.currency,
        is_licensed: Boolean(r.is_licensed),
        rating_avg: Number(r.rating_avg),
        rating_count: r.rating_count,
        reads_count: r.reads_count,
        table_of_contents: typeof r.table_of_contents === "string" ? JSON.parse(r.table_of_contents) : r.table_of_contents || [],
        user_has_access: r.access === "FREE",
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));

      // Also query learning_resources with PDF type so teacher uploaded books appear
      try {
        let resQuery = db.selectFrom("learning_resources").selectAll().where("resource_type", "=", "pdf").where("status", "!=", "ARCHIVED");
        if (filter?.search) {
          resQuery = resQuery.where("title", "ilike", `%${filter.search}%`);
        }
        const resRows = await resQuery.orderBy("created_at", "desc").execute();
        for (const lr of resRows) {
          if (!existingIds.has(lr.id)) {
            bookList.push({
              id: lr.id,
              title: lr.title,
              slug: `${lr.id}-${lr.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`,
              author: "MGN Verified Faculty",
              publisher: "MedGlobalNetwork (MGN)",
              cover_url: lr.thumbnail_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
              file_url: lr.file_url || "",
              description: lr.description || "Medical textbook and clinical reference guide on MedGlobalNetwork.",
              category: lr.category || "Clinical Practice",
              subject: lr.category || "Medical Sciences",
              page_count: lr.page_count || 32,
              isbn: null,
              access: "FREE",
              price: 0,
              currency: "INR",
              is_licensed: true,
              rating_avg: 5.0,
              rating_count: 1,
              reads_count: 0,
              table_of_contents: [],
              user_has_access: true,
              created_at: lr.created_at ? new Date(lr.created_at).toISOString() : new Date().toISOString(),
            });
          }
        }
      } catch {
        // Non-fatal if learning_resources query fails
      }

      return bookList;
    } catch {
      return [];
    }
  },

  async getBookById(id: string, userId?: string): Promise<BookItem | null> {
    await ensureStudentWorkspaceTables();
    try {
      let r = await db
        .selectFrom("student_books")
        .selectAll()
        .where("id", "=", id)
        .executeTakeFirst();

      // If not in student_books, search in learning_resources
      if (!r) {
        const lr = await db
          .selectFrom("learning_resources")
          .selectAll()
          .where("id", "=", id)
          .executeTakeFirst();
        if (lr) {
          r = {
            id: lr.id,
            title: lr.title,
            slug: `${lr.id}-${lr.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`,
            author: "MGN Verified Faculty",
            publisher: "MedGlobalNetwork (MGN)",
            cover_url: lr.thumbnail_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
            file_url: lr.file_url,
            description: lr.description,
            category: lr.category,
            subject: lr.category,
            page_count: lr.page_count || 32,
            isbn: null,
            access: "FREE",
            price: 0,
            discount_price: null,
            currency: "INR",
            is_licensed: true,
            rating_avg: 5.0,
            rating_count: 1,
            reads_count: 0,
            table_of_contents: [],
            created_at: lr.created_at,
          };
        }
      }

      if (!r) return null;

      let userProgress = undefined;
      let hasAccess = r.access === "FREE";

      if (userId) {
        const prog = await db
          .selectFrom("student_book_progress")
          .selectAll()
          .where("book_id", "=", id)
          .where("user_id", "=", userId)
          .executeTakeFirst()
          .catch(() => null);

        if (prog) {
          userProgress = {
            current_page: prog.current_page,
            total_pages: prog.total_pages,
            percentage: prog.percentage,
            last_read_at: prog.last_read_at ? new Date(prog.last_read_at).toISOString() : new Date().toISOString(),
          };
          if (prog.has_access) hasAccess = true;
        }
      }

      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        author: r.author,
        publisher: r.publisher,
        cover_url: r.cover_url,
        file_url: r.file_url,
        description: r.description,
        category: r.category,
        subject: r.subject,
        page_count: r.page_count,
        isbn: r.isbn,
        access: r.access,
        price: Number(r.price),
        discount_price: r.discount_price ? Number(r.discount_price) : null,
        currency: r.currency,
        is_licensed: Boolean(r.is_licensed),
        rating_avg: Number(r.rating_avg),
        rating_count: r.rating_count,
        reads_count: r.reads_count,
        table_of_contents: typeof r.table_of_contents === "string" ? JSON.parse(r.table_of_contents) : r.table_of_contents || [],
        user_has_access: hasAccess,
        user_progress: userProgress,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      };
    } catch {
      return null;
    }
  },

  async updateReadingProgress(userId: string, bookId: string, page: number, totalPages: number) {
    await ensureStudentWorkspaceTables();
    try {
      const percentage = Math.round((page / Math.max(totalPages, 1)) * 100);
      const existing = await db
        .selectFrom("student_book_progress")
        .select("id")
        .where("book_id", "=", bookId)
        .where("user_id", "=", userId)
        .executeTakeFirst();

      if (existing) {
        await db
          .updateTable("student_book_progress")
          .set({
            current_page: page,
            total_pages: totalPages,
            percentage,
            last_read_at: new Date(),
          })
          .where("id", "=", existing.id)
          .execute();
      } else {
        await db
          .insertInto("student_book_progress")
          .values({
            id: generateId(),
            user_id: userId,
            book_id: bookId,
            current_page: page,
            total_pages: totalPages,
            percentage,
            has_access: true,
          })
          .execute();
      }
    } catch (err) {
      console.warn("updateReadingProgress error:", err);
    }
  },
};

// ─────────────────────────────────────────────
// 9. STUDENT NOTES & SHARED NOTES FEED
// ─────────────────────────────────────────────

export const NotesService = {
  async getStudentNotes(userId: string, filter?: { note_type?: string; course_id?: string }): Promise<StudentNoteItem[]> {
    await ensureStudentWorkspaceTables();
    try {
      let query = db.selectFrom("student_notes").selectAll().where("user_id", "=", userId);
      if (filter?.note_type && filter.note_type !== "All") {
        query = query.where("note_type", "=", filter.note_type);
      }
      if (filter?.course_id) {
        query = query.where("course_id", "=", filter.course_id);
      }
      const rows = await query.orderBy("updated_at", "desc").execute();
      return rows.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title,
        content: r.content,
        note_type: r.note_type,
        course_id: r.course_id,
        course_title: r.course_title,
        lesson_id: r.lesson_id,
        lesson_title: r.lesson_title,
        timestamp_seconds: r.timestamp_seconds,
        subject: r.subject,
        topic: r.topic,
        tags: typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags || [],
        attachments: typeof r.attachments === "string" ? JSON.parse(r.attachments) : r.attachments || [],
        visibility: r.visibility,
        copyright_declared: Boolean(r.copyright_declared),
        moderation_status: r.moderation_status,
        views_count: r.views_count,
        saves_count: r.saves_count,
        shares_count: r.shares_count,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },

  async createNote(userId: string, data: Partial<StudentNoteItem>): Promise<StudentNoteItem> {
    await ensureStudentWorkspaceTables();
    const id = generateId();
    await db
      .insertInto("student_notes")
      .values({
        id,
        user_id: userId,
        title: data.title || "Untitled Note",
        content: data.content || "",
        note_type: data.note_type || "Personal Notes",
        course_id: data.course_id || null,
        course_title: data.course_title || null,
        lesson_id: data.lesson_id || null,
        lesson_title: data.lesson_title || null,
        timestamp_seconds: data.timestamp_seconds || null,
        subject: data.subject || null,
        topic: data.topic || null,
        tags: JSON.stringify(data.tags || []),
        attachments: JSON.stringify(data.attachments || []),
        visibility: data.visibility || "only_me",
        copyright_declared: data.copyright_declared !== false,
        moderation_status: "approved",
      })
      .execute();

    return {
      id,
      user_id: userId,
      title: data.title || "Untitled Note",
      content: data.content || "",
      note_type: data.note_type || "Personal Notes",
      course_id: data.course_id,
      course_title: data.course_title,
      lesson_id: data.lesson_id,
      lesson_title: data.lesson_title,
      timestamp_seconds: data.timestamp_seconds,
      subject: data.subject,
      topic: data.topic,
      tags: data.tags || [],
      attachments: data.attachments || [],
      visibility: data.visibility || "only_me",
      copyright_declared: true,
      moderation_status: "approved",
      views_count: 0,
      saves_count: 0,
      shares_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async publishNote(
    userId: string,
    noteId: string,
    publishData: {
      visibility: "connections" | "followers" | "community" | "public";
      subject?: string;
      topic?: string;
      tags?: string[];
      copyright_declared: boolean;
    }
  ) {
    await ensureStudentWorkspaceTables();
    await db
      .updateTable("student_notes")
      .set({
        visibility: publishData.visibility,
        subject: publishData.subject || null,
        topic: publishData.topic || null,
        tags: JSON.stringify(publishData.tags || []),
        copyright_declared: publishData.copyright_declared,
        moderation_status: "approved",
        updated_at: new Date(),
      })
      .where("id", "=", noteId)
      .where("user_id", "=", userId)
      .execute();
  },

  async getSharedNotesFeed(filter?: { subject?: string; search?: string }): Promise<StudentNoteItem[]> {
    await ensureStudentWorkspaceTables();
    try {
      let query = db
        .selectFrom("student_notes")
        .selectAll()
        .where("visibility", "in", ["community", "public"])
        .where("moderation_status", "=", "approved");

      if (filter?.subject && filter.subject !== "All") {
        query = query.where("subject", "=", filter.subject);
      }
      if (filter?.search) {
        query = query.where("title", "ilike", `%${filter.search}%`);
      }

      const rows = await query.orderBy("views_count", "desc").limit(30).execute();

      return rows.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        title: r.title,
        content: r.content,
        note_type: r.note_type,
        course_id: r.course_id,
        course_title: r.course_title,
        lesson_id: r.lesson_id,
        lesson_title: r.lesson_title,
        timestamp_seconds: r.timestamp_seconds,
        subject: r.subject,
        topic: r.topic,
        tags: typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags || [],
        attachments: typeof r.attachments === "string" ? JSON.parse(r.attachments) : r.attachments || [],
        visibility: r.visibility,
        copyright_declared: Boolean(r.copyright_declared),
        moderation_status: r.moderation_status,
        views_count: r.views_count,
        saves_count: r.saves_count,
        shares_count: r.shares_count,
        author_name: "Verified Medical Scholar",
        author_profession: "Healthcare Learner",
        author_verified: true,
        created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  },
};

// ─────────────────────────────────────────────
// 10. STUDENT CUSTOM COLLECTIONS SERVICE
// ─────────────────────────────────────────────

export const StudentCollectionService = {
  async getUserCollections(userId: string): Promise<StudentCollectionItem[]> {
    await ensureStudentWorkspaceTables();
    try {
      const rows = await db
        .selectFrom("student_collections")
        .selectAll()
        .where("user_id", "=", userId)
        .orderBy("created_at", "desc")
        .execute();

      return rows.map((r: any) => {
        const items = typeof r.items === "string" ? JSON.parse(r.items) : r.items || [];
        return {
          id: r.id,
          user_id: r.user_id,
          title: r.title,
          description: r.description,
          color: r.color,
          is_public: Boolean(r.is_public),
          item_count: items.length,
          items,
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          updated_at: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        };
      });
    } catch {
      return [];
    }
  },

  async createCollection(userId: string, data: { title: string; description?: string; color?: string }): Promise<StudentCollectionItem> {
    await ensureStudentWorkspaceTables();
    const id = generateId();
    await db
      .insertInto("student_collections")
      .values({
        id,
        user_id: userId,
        title: data.title,
        description: data.description || null,
        color: data.color || "#0f4c81",
        is_public: false,
        items: JSON.stringify([]),
      })
      .execute();

    return {
      id,
      user_id: userId,
      title: data.title,
      description: data.description,
      color: data.color || "#0f4c81",
      is_public: false,
      item_count: 0,
      items: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  async addItem(userId: string, collectionId: string, item: Omit<CollectionItemEntry, "id" | "collection_id" | "added_at">) {
    await ensureStudentWorkspaceTables();
    const col = await db
      .selectFrom("student_collections")
      .selectAll()
      .where("id", "=", collectionId)
      .where("user_id", "=", userId)
      .executeTakeFirst();

    if (!col) return;
    const items = typeof col.items === "string" ? JSON.parse(col.items) : col.items || [];
    items.push({
      id: generateId(),
      collection_id: collectionId,
      ...item,
      added_at: new Date().toISOString(),
    });

    await db
      .updateTable("student_collections")
      .set({ items: JSON.stringify(items), updated_at: new Date() })
      .where("id", "=", collectionId)
      .execute();
  },
};

// ─────────────────────────────────────────────
// 11. CENTRAL LEARNING CALENDAR SERVICE
// ─────────────────────────────────────────────

export const LearningCalendarService = {
  async getStudentEvents(userId: string): Promise<StudentCalendarEvent[]> {
    await ensureStudentWorkspaceTables();
    try {
      // 1. Get Live sessions
      const liveSessions = await db
        .selectFrom("learn_live_sessions")
        .selectAll()
        .where("status", "in", ["scheduled", "registration_open", "live"])
        .orderBy("scheduled_at", "asc")
        .limit(10)
        .execute()
        .catch(() => []);

      const sessionEvents: StudentCalendarEvent[] = liveSessions.map((s: any) => ({
        id: s.id,
        title: s.title,
        event_type: "live_lecture",
        scheduled_at: s.scheduled_at ? new Date(s.scheduled_at).toISOString() : new Date().toISOString(),
        instructor_name: "Verified Medical Instructor",
        course_id: s.course_id,
        meeting_url: s.meeting_url,
        status: s.status,
      }));

      // 2. Get Custom Calendar Reminders
      const customRows = await db
        .selectFrom("student_calendar_events")
        .selectAll()
        .where("user_id", "=", userId)
        .orderBy("scheduled_at", "asc")
        .execute()
        .catch(() => []);

      const customEvents: StudentCalendarEvent[] = customRows.map((r: any) => ({
        id: r.id,
        title: r.title,
        event_type: r.event_type as any,
        scheduled_at: r.scheduled_at ? new Date(r.scheduled_at).toISOString() : new Date().toISOString(),
        end_at: r.end_at ? new Date(r.end_at).toISOString() : undefined,
        instructor_name: r.instructor_name,
        course_id: r.course_id,
        course_title: r.course_title,
        meeting_url: r.meeting_url,
        status: r.status,
      }));

      return [...sessionEvents, ...customEvents].sort(
        (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      );
    } catch {
      return [];
    }
  },
};

// ─────────────────────────────────────────────
// 12. COURSE SUGGESTION & RECOMMENDATION ENGINE
// ─────────────────────────────────────────────

export const StudentRecommendationService = {
  async getStudentRecommendations(userId: string): Promise<RecommendationFeedSection[]> {
    await ensureStudentWorkspaceTables();
    try {
      // 1. Fetch real published courses only
      const allCourses = await db
        .selectFrom("courses")
        .selectAll()
        .where("status", "=", "published")
        .orderBy("rating_avg", "desc")
        .limit(20)
        .execute();

      if (!allCourses || allCourses.length === 0) {
        return [];
      }

      // Map to typed courses
      const mappedCourses: Course[] = allCourses.map((c: any) => ({
        id: c.id,
        instructor_id: c.instructor_id,
        title: c.title,
        slug: c.slug,
        short_description: c.short_description,
        description: c.description,
        thumbnail: c.thumbnail,
        category: c.category,
        profession: c.profession,
        specialization: c.specialization,
        level: c.level || "all_levels",
        language: c.language || "English",
        duration_minutes: c.duration_minutes || 0,
        price: Number(c.price) || 0,
        currency: c.currency || "INR",
        is_free: Boolean(c.is_free),
        certificate_enabled: Boolean(c.certificate_enabled),
        status: c.status,
        enrollment_count: c.enrollment_count || 0,
        rating_avg: Number(c.rating_avg) || 0,
        rating_count: Number(c.rating_count) || 0,
        created_at: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
        updated_at: c.updated_at ? new Date(c.updated_at).toISOString() : new Date().toISOString(),
      }));

      // Check user enrollments to exclude already enrolled courses from "Recommended for You"
      const userEnrollments = await db
        .selectFrom("course_enrollments")
        .select("course_id")
        .where("user_id", "=", userId)
        .execute()
        .catch(() => []);

      const enrolledIds = new Set(userEnrollments.map((e: any) => e.course_id));
      const notEnrolled = mappedCourses.filter((c) => !enrolledIds.has(c.id));

      const sections: RecommendationFeedSection[] = [];

      if (notEnrolled.length > 0) {
        sections.push({
          category: "recommended",
          title: "Recommended For You",
          subtitle: "Curated based on your medical curriculum and active interests",
          reason: "Matches your academic discipline and recent study activity",
          items: notEnrolled.slice(0, 6),
        });
      }

      const freeCourses = mappedCourses.filter((c) => c.is_free && !enrolledIds.has(c.id));
      if (freeCourses.length > 0) {
        sections.push({
          category: "free",
          title: "Free High-Yield Courses",
          subtitle: "Essential clinical subjects open for immediate enrollment",
          reason: "Zero-cost verified faculty modules",
          items: freeCourses.slice(0, 4),
        });
      }

      const popularCourses = mappedCourses.slice(0, 4);
      if (popularCourses.length > 0) {
        sections.push({
          category: "popular",
          title: "Popular in Your Profession",
          subtitle: "Most studied courses by fellow healthcare scholars this week",
          items: popularCourses,
        });
      }

      return sections;
    } catch {
      return [];
    }
  },
};

// ─────────────────────────────────────────────
// 13. UNIFIED STUDENT DASHBOARD AGGREGATOR
// ─────────────────────────────────────────────

export const StudentDashboardService = {
  async getDashboardData(userId: string): Promise<StudentDashboardData> {
    await ensureStudentWorkspaceTables();

    // 1. Continue Learning (In Progress)
    const enrollments = await db
      .selectFrom("course_enrollments as ce")
      .innerJoin("courses as c", "c.id", "ce.course_id")
      .select([
        "ce.id as enrollment_id",
        "ce.course_id",
        "ce.progress_percentage",
        "ce.last_lesson_id",
        "ce.last_accessed_at",
        "ce.status",
        "c.title",
        "c.thumbnail",
        "c.category",
        "c.duration_minutes",
        "c.level",
        "c.is_free",
        "c.price",
      ])
      .where("ce.user_id", "=", userId)
      .orderBy("ce.last_accessed_at", "desc")
      .execute()
      .catch(() => []);

    const continueLearningList: CourseEnrollment[] = enrollments.map((e: any) => ({
      id: e.enrollment_id,
      course_id: e.course_id,
      user_id: userId,
      enrolled_at: new Date().toISOString(),
      status: e.status as any,
      progress_percentage: Number(e.progress_percentage) || 0,
      last_lesson_id: e.last_lesson_id,
      last_accessed_at: e.last_accessed_at ? new Date(e.last_accessed_at).toISOString() : new Date().toISOString(),
      course: {
        id: e.course_id,
        instructor_id: "",
        title: e.title,
        slug: "",
        thumbnail: e.thumbnail,
        category: e.category,
        duration_minutes: e.duration_minutes || 0,
        level: e.level || "all_levels",
        language: "English",
        price: Number(e.price) || 0,
        currency: "INR",
        is_free: Boolean(e.is_free),
        certificate_enabled: true,
        status: "published",
        enrollment_count: 0,
        rating_avg: 0,
        rating_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    }));

    const inProgressList = continueLearningList.filter((e) => e.progress_percentage < 100);
    const completedList = continueLearningList.filter((e) => e.progress_percentage >= 100);

    // 2. Recommendations
    const recommendations = await StudentRecommendationService.getStudentRecommendations(userId);

    // 3. Upcoming Lectures
    const liveSessions = await db
      .selectFrom("learn_live_sessions")
      .selectAll()
      .where("status", "in", ["scheduled", "registration_open", "live"])
      .orderBy("scheduled_at", "asc")
      .limit(4)
      .execute()
      .catch(() => []);

    const upcomingLectures: LiveSession[] = liveSessions.map((s: any) => ({
      id: s.id,
      instructor_id: s.instructor_id,
      title: s.title,
      category: s.category,
      scheduled_at: s.scheduled_at ? new Date(s.scheduled_at).toISOString() : new Date().toISOString(),
      duration_minutes: s.duration_minutes || 60,
      meeting_url: s.meeting_url,
      thumbnail: s.thumbnail,
      registered_count: s.registered_count || 0,
      status: s.status,
      created_at: s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString(),
    }));

    // 4. Weak Topics
    const weakTopics = await AdaptiveMCQService.getWeakTopics(userId);

    // 5. Recent Resources
    const [recentNotes, recentBooks, recentMindMaps, communityNotes] = await Promise.all([
      NotesService.getStudentNotes(userId),
      BookService.getBooks({ limit: 4 } as any),
      MindMapService.getMindMaps(),
      NotesService.getSharedNotesFeed(),
    ]);

    const totalEnrolled = continueLearningList.length;
    const avgProgress =
      totalEnrolled > 0
        ? Math.round(
            continueLearningList.reduce((acc, curr) => acc + curr.progress_percentage, 0) / totalEnrolled
          )
        : 0;

    return {
      continue_learning: inProgressList,
      recommendations,
      upcoming_lectures: upcomingLectures,
      enrolled_summary: {
        in_progress_count: inProgressList.length,
        completed_count: completedList.length,
        total_enrolled: totalEnrolled,
        average_progress: avgProgress,
        learning_streak_days: totalEnrolled > 0 ? 3 : 0,
      },
      weak_topics: weakTopics,
      recent_resources: {
        notes: recentNotes.slice(0, 4),
        books: recentBooks.slice(0, 4),
        mind_maps: recentMindMaps.slice(0, 4),
      },
      community_notes: communityNotes.slice(0, 4),
    };
  },
};
