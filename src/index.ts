import {
  type Plugin,
  type Action,
  type IAgentRuntime,
  type Memory,
  type HandlerCallback,
  type State,
} from "@elizaos/core";

const VRS_DIMENSIONS: Record<string, string> = {
  F1: "Personal & Professional Values",
  F2: "Cognitive & Learning Readiness",
  F3: "Interpersonal & Digital Competence",
  F4: "Civic & Ethical Orientation",
  F5: "Resilience, Flexibility & Ethics",
};

const ASSESSMENT_QUESTIONS = [
  { id: 1, dimension: "F1", text: "On a scale of 1–5, how clearly defined are your professional goals right now? (1 = no clear direction, 5 = very clear long-term plan)" },
  { id: 2, dimension: "F1", text: "How well do your personal values align with the type of work environment you're targeting? (1 = big mismatch, 5 = strong alignment)" },
  { id: 3, dimension: "F2", text: "How comfortable are you learning new tools or frameworks under time pressure? (1 = very uncomfortable, 5 = thrive in it)" },
  { id: 4, dimension: "F2", text: "In the last 12 months, how actively have you pursued learning outside formal education or your job? (1 = not at all, 5 = consistently)" },
  { id: 5, dimension: "F3", text: "How confident are you working in multicultural or cross-border teams? (1 = very uncomfortable, 5 = very confident)" },
  { id: 6, dimension: "F3", text: "How would you rate your ability to use digital tools for remote collaboration? (1 = basic, 5 = highly proficient)" },
  { id: 7, dimension: "F4", text: "How important is it that your work contributes to something beyond personal gain? (1 = not important, 5 = central to why I work)" },
  { id: 8, dimension: "F4", text: "When workplace norms conflict with your ethical standards, how do you respond? (1 = I comply to avoid conflict, 5 = I speak up and seek resolution)" },
  { id: 9, dimension: "F5", text: "Think of a major setback in the last 2 years. How would you rate your recovery and adaptation? (1 = still struggling, 5 = adapted and grew stronger)" },
  { id: 10, dimension: "F5", text: "How comfortable are you with ambiguity — starting in a new role or country where rules aren't fully clear? (1 = need clear structure, 5 = energised by ambiguity)" },
];

function scoreProfile(answers: number[]) {
  const raw: Record<string, number[]> = { F1: [], F2: [], F3: [], F4: [], F5: [] };
  ASSESSMENT_QUESTIONS.forEach((q, i) => {
    if (answers[i] !== undefined) raw[q.dimension].push(answers[i]);
  });
  const scores: Record<string, number> = {};
  for (const [dim, vals] of Object.entries(raw)) {
    scores[dim] = vals.length > 0
      ? Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 5)) * 100)
      : 0;
  }
  const total = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5);
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const strongest = sorted[0][0];
  const weakest = sorted[sorted.length - 1][0];
  const level =
    total >= 80 ? "High Readiness" :
    total >= 60 ? "Moderate Readiness" :
    total >= 40 ? "Developing Readiness" : "Early Stage";
  return { scores, total, strongest, weakest, level };
}

function getMarkets(scores: Record<string, number>, total: number): string {
  const recs: string[] = [];
  if (scores.F3 >= 70 && scores.F2 >= 70) {
    recs.push("🇨🇦 Canada (Express Entry — strong fit for tech and professional services)");
    recs.push("🇬🇧 UK (Skilled Worker Visa — values your digital competence)");
  }
  if (scores.F5 >= 70 && scores.F1 >= 60) {
    recs.push("🇩🇪 Germany (Job Seeker Visa — rewards resilience and clear professional identity)");
    recs.push("🇳🇱 Netherlands (Highly Skilled Migrant — suits adaptable self-directed professionals)");
  }
  if (scores.F4 >= 70) recs.push("🌍 Remote-first roles (NGOs, social enterprises, impact-driven companies)");
  if (total >= 70) recs.push("🇺🇸 USA (O-1 or EB pathways if you have demonstrable achievement)");
  if (recs.length === 0) {
    recs.push("🌐 Remote freelance markets (build international track record first)");
    recs.push("🇿🇦 South Africa / Rwanda (intra-African opportunity with lower readiness threshold)");
  }
  return recs.slice(0, 3).join("\n");
}

function getNextSteps(weakest: string): string {
  const steps: Record<string, string[]> = {
    F1: [
      "1. Write a 1-page personal positioning statement — your field, your value, your target market",
      "2. Identify 3 specific roles in your target country and map your experience to their requirements",
      "3. Talk to 2 people already working in your target market within the next 30 days",
    ],
    F2: [
      "1. Start one structured learning path this week (Coursera, edX — pick one and commit)",
      "2. Document your learning publicly — a weekly LinkedIn post or GitHub commit builds credibility",
      "3. Set a 90-day learning goal with a measurable output (a certificate, a project, a skill demo)",
    ],
    F3: [
      "1. Join one international online community in your field and contribute meaningfully this month",
      "2. Practice async communication — write a detailed project update as if for a remote team",
      "3. Get comfortable on video: record yourself explaining your work and watch it back",
    ],
    F4: [
      "1. Identify the values of 3 companies you'd want to work for and assess your fit honestly",
      "2. Practice articulating your ethical line — what would you not do for a job?",
      "3. Research the civic and professional norms of your target country",
    ],
    F5: [
      "1. Write down your biggest professional setback and what it taught you — this becomes your interview story",
      "2. Put yourself in one uncomfortable situation per week — cold outreach, a hard conversation",
      "3. Build a financial buffer of at least 3 months expenses before making a major move",
    ],
  };
  return (steps[weakest] ?? steps.F1).join("\n");
}

function buildReport(
  ctx: { country: string; field: string; target: string },
  answers: number[]
): string {
  const { scores, total, strongest, weakest, level } = scoreProfile(answers);
  const bar = (s: number) =>
    "█".repeat(Math.round(s / 10)) + "░".repeat(10 - Math.round(s / 10)) + ` ${s}%`;
  return [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "📊 VALUESCOPE READINESS REPORT",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Profile: ${ctx.field} professional from ${ctx.country}`,
    `Target: ${ctx.target}`,
    `Overall Readiness: ${total}% — ${level}`,
    "",
    "DIMENSION SCORES",
    `${VRS_DIMENSIONS.F1}: ${bar(scores.F1)}`,
    `${VRS_DIMENSIONS.F2}: ${bar(scores.F2)}`,
    `${VRS_DIMENSIONS.F3}: ${bar(scores.F3)}`,
    `${VRS_DIMENSIONS.F4}: ${bar(scores.F4)}`,
    `${VRS_DIMENSIONS.F5}: ${bar(scores.F5)}`,
    "",
    `STRONGEST: ${VRS_DIMENSIONS[strongest]} — Lead with this.`,
    `DEVELOP: ${VRS_DIMENSIONS[weakest]} — Addressing this moves the needle most.`,
    "",
    "RECOMMENDED MARKETS",
    getMarkets(scores, total),
    "",
    "YOUR 3 NEXT STEPS",
    getNextSteps(weakest),
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "Based on Value Readiness Scale (Leonova & Durojaiye, 2025)",
    "Running on Nosana decentralized GPU infrastructure",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  ].join("\n");
}

type SessionStage = "context" | "questions" | "complete";
interface Session {
  stage: SessionStage;
  context: { country: string; field: string; target: string };
  answers: number[];
  currentQuestion: number;
}

const sessions = new Map<string, Session>();

function extractScore(text: string): number | null {
  const match = text.match(/\b([1-5])\b/);
  if (match) return parseInt(match[1]);
  const words: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  for (const [w, v] of Object.entries(words)) {
    if (text.includes(w)) return v;
  }
  return null;
}

function extractCountry(text: string): string | null {
  const list = ["nigeria", "ghana", "kenya", "south africa", "ethiopia", "tanzania",
    "uganda", "cameroon", "senegal", "zimbabwe", "zambia", "rwanda"];
  for (const c of list) {
    if (text.includes(c)) return c.charAt(0).toUpperCase() + c.slice(1);
  }
  return null;
}

function extractField(text: string): string | null {
  const list = ["software", "engineering", "nursing", "medicine", "finance", "accounting",
    "marketing", "business", "law", "education", "design", "data", "product",
    "sales", "operations", "research", "journalism", "architecture"];
  for (const f of list) {
    if (text.includes(f)) return f;
  }
  return null;
}

const send = async (cb: HandlerCallback | undefined, text: string) => {
  if (cb) await cb({ text });
};

const valueReadinessAction: Action = {
  name: "VALUE_READINESS_ASSESSMENT",
  description: "Run a Value Readiness Scale assessment for African professionals seeking global opportunities",
  similes: ["ASSESS", "ASSESSMENT", "READY", "READINESS", "ABROAD", "RELOCATE",
    "JAPA", "CAREER", "GLOBAL", "OPPORTUNITY", "EMIGRATE", "VALUESCOPE",
    "START", "BEGIN", "HELP", "EVALUATE"],
  validate: async () => true,
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state?: State,
    _options?: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    const userId = (message.entityId ?? message.roomId ?? "default") as string;
    const text = ((message.content as { text?: string }).text ?? "").toLowerCase().trim();

    let session = sessions.get(userId);

    if (text.includes("restart") || text.includes("reset") || text.includes("start over")) {
      sessions.delete(userId);
      session = undefined;
    }

    if (!session) {
      sessions.set(userId, {
        stage: "context",
        context: { country: "", field: "", target: "" },
        answers: [],
        currentQuestion: 0,
      });
      await send(callback,
        `Welcome to **ValueScope** — your personal readiness assessment for global career opportunities.\n\n` +
        `I'm based on the Value Readiness Scale (VRS), a peer-reviewed sociological framework by Leonova & Durojaiye (2025), ` +
        `measuring professional readiness across five dimensions.\n\n` +
        `The assessment takes about 3 minutes — 10 questions, each rated 1–5.\n\n` +
        `To start: **tell me your country, your field (e.g. software engineering, nursing, business development), ` +
        `and what opportunity you're targeting** (e.g. "relocate to Canada", "find remote international work").`
      );
      return;
    }

    if (session.stage === "context") {
      session.context.country = extractCountry(text) ?? "Nigeria";
      session.context.field = extractField(text) ?? "professional";
      session.context.target = text.slice(0, 120);
      session.stage = "questions";
      session.currentQuestion = 0;
      const q = ASSESSMENT_QUESTIONS[0];
      await send(callback,
        `Got it. Let's begin.\n\n**Question 1 of 10** _(${VRS_DIMENSIONS[q.dimension]})_\n\n${q.text}`
      );
      return;
    }

    if (session.stage === "questions") {
      const score = extractScore(text);
      if (score === null) {
        const q = ASSESSMENT_QUESTIONS[session.currentQuestion];
        await send(callback, `Please rate that **1 to 5** — just type a number.\n\n${q.text}`);
        return;
      }

      session.answers.push(score);
      session.currentQuestion++;

      if (session.currentQuestion < ASSESSMENT_QUESTIONS.length) {
        const q = ASSESSMENT_QUESTIONS[session.currentQuestion];
        const isNewDim = session.currentQuestion % 2 === 0;
        const notice = isNewDim ? `\n_Moving to: ${VRS_DIMENSIONS[q.dimension]}_\n\n` : "\n\n";
        await send(callback, `**Question ${session.currentQuestion + 1} of 10**${notice}${q.text}`);
        return;
      }

      session.stage = "complete";
      await send(callback, buildReport(session.context, session.answers));
      await send(callback,
        `That's your ValueScope report. Want me to go deeper on any dimension or talk through your next steps?\n\nType **restart** to run a new assessment.`
      );
      return;
    }

    await send(callback,
      `Your assessment is complete. Type **restart** to begin a new one, or ask about any part of your results.`
    );
  },
  examples: [],
};

export const customPlugin: Plugin = {
  name: "valuescope-plugin",
  description: "Value Readiness Scale assessment for African professionals targeting global opportunities",
  actions: [valueReadinessAction],
  providers: [],
  evaluators: [],
};

export default customPlugin;
