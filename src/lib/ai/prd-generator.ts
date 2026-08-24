import type { IPRDFeature, IPRDTechStack, IPRDApiEndpoint } from "@/lib/models/PRD";

export interface GeneratedMilestone {
  title: string;
  description: string;
  order: number;
  targetDays: number;
  deliverables: string[];
}

export interface GeneratedPRDData {
  title: string;
  overview: {
    summary: string;
    problemStatement: string;
    targetAudience: string[];
    successMetrics: string[];
  };
  features: IPRDFeature[];
  techStack: IPRDTechStack[];
  apiEndpoints: IPRDApiEndpoint[];
  milestones: GeneratedMilestone[];
  diagrams: {
    mindmapMermaid: string;
    architectureMermaid: string;
    erDiagramMermaid: string;
  };
  rawMarkdown: string;
}

export async function generatePRDFromProject(input: {
  title: string;
  description: string;
  problemStatement: string;
  domain: string;
  requiredSkills: string[];
  teamSizeMax?: number;
}): Promise<GeneratedPRDData> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `You are an elite Principal Software Architect and Technical Product Manager.
Generate a comprehensive, production-grade Product Requirement Document (PRD) and structured milestone roadmap for the following project:

Title: "${input.title}"
Domain: "${input.domain}"
Description: "${input.description}"
Problem Statement: "${input.problemStatement}"
Required Skills: ${JSON.stringify(input.requiredSkills)}

You must respond ONLY with a clean JSON object adhering strictly to this schema:
{
  "title": string,
  "overview": {
    "summary": string (detailed technical overview),
    "problemStatement": string (detailed problem breakdown),
    "targetAudience": [string],
    "successMetrics": [string]
  },
  "features": [
    {
      "id": string (e.g. "feat-1"),
      "title": string,
      "description": string,
      "priority": "MUST_HAVE" | "SHOULD_HAVE" | "NICE_TO_HAVE",
      "phase": "MVP" | "V2" | "FUTURE",
      "suggestedSkills": [string],
      "acceptanceCriteria": [string]
    }
  ],
  "techStack": [
    {
      "category": string (e.g. "Frontend", "Backend", "Database", "Authentication", "Deployment"),
      "technology": string,
      "reasoning": string
    }
  ],
  "apiEndpoints": [
    {
      "method": "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
      "path": string,
      "description": string,
      "payload": string (optional JSON example),
      "response": string (optional JSON example)
    }
  ],
  "milestones": [
    {
      "title": string (e.g. "Sprint 1: Architecture & Foundation"),
      "description": string,
      "order": number (1, 2, 3, 4),
      "targetDays": number (e.g. 7, 14, 21, 28),
      "deliverables": [string]
    }
  ],
  "diagrams": {
    "mindmapMermaid": string (A valid Mermaid mindmap diagram starting with "mindmap\\n  root((${input.title}))"),
    "architectureMermaid": string (A valid Mermaid graph TD diagram showing system flow and layers),
    "erDiagramMermaid": string (A valid Mermaid erDiagram showing core database entities and relationships)
  }
}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2,
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          if (!parsed.milestones || !parsed.milestones.length) {
            parsed.milestones = getDefaultMilestones(input);
          }
          parsed.rawMarkdown = formatPRDToMarkdown(parsed);
          return parsed as GeneratedPRDData;
        }
      }
    } catch (err) {
      console.warn("Gemini PRD generation failed, using intelligent architecture template generator:", err);
    }
  }

  // Resilient Architectural Synthesizer Fallback
  return generateHeuristicPRD(input);
}

function getDefaultMilestones(input: { title: string; domain: string }): GeneratedMilestone[] {
  return [
    {
      title: "Sprint 1: System Foundation & Core Architecture",
      description: "Initialize project environment, secure authentication layer, and database entity schemas.",
      order: 1,
      targetDays: 7,
      deliverables: [
        "Configure NextAuth authentication and session management.",
        "Set up Mongoose schemas with compound indexes and validation.",
        "Deploy basic navigation layout and project settings."
      ]
    },
    {
      title: "Sprint 2: MVP Workflows & Interaction Hub",
      description: "Implement primary user journeys, team workspace channels, and interactive Kanban boards.",
      order: 2,
      targetDays: 14,
      deliverables: [
        "Build Kanban task management with drag-and-drop status transitions.",
        "Create shared team workspace with persistent notes and group chat.",
        "Integrate AI candidate matchmaking and outbound invitation modals."
      ]
    },
    {
      title: "Sprint 3: AI Intelligence & Automation Sync",
      description: "Integrate Living PRD Studio, interactive Mind Maps, and automated GitHub Webhook sync.",
      order: 3,
      targetDays: 21,
      deliverables: [
        "Deploy on-demand AI PRD and Mermaid visual diagram generator.",
        "Implement 1-click Spec-to-Kanban task decomposition.",
        "Connect GitHub push webhooks for automatic task resolution."
      ]
    },
    {
      title: "Sprint 4: Hardening, Beta Testing & Launch",
      description: "Perform end-to-end testing, responsive polish, performance profiling, and public deployment.",
      order: 4,
      targetDays: 28,
      deliverables: [
        "Run accessibility (a11y) and Core Web Vitals performance audit.",
        "Verify all API route error handlers and database connection pooling.",
        "Deploy live demo showcase and invite early community testers."
      ]
    }
  ];
}

function generateHeuristicPRD(input: {
  title: string;
  description: string;
  problemStatement: string;
  domain: string;
  requiredSkills: string[];
}): GeneratedPRDData {
  const domain = input.domain || "Web Dev";
  const title = input.title.trim() || "Collaborative Platform";

  const features: IPRDFeature[] = [
    {
      id: "feat-1",
      title: "User Authentication & Profile Setup",
      description: "Secure session management with JWT / OAuth, customizable portfolio links, and skill taxonomy.",
      priority: "MUST_HAVE",
      phase: "MVP",
      suggestedSkills: ["NextAuth", "TypeScript", "React"],
      acceptanceCriteria: [
        "Users can register and log in securely with email & password or OAuth.",
        "Profile page shows badges, bio, GitHub/LinkedIn links, and verified skills."
      ]
    },
    {
      id: "feat-2",
      title: "Core Data Model & Database Persistence",
      description: "Optimized relational / document database schema with compound indexing for low latency queries.",
      priority: "MUST_HAVE",
      phase: "MVP",
      suggestedSkills: ["MongoDB", "Mongoose", "PostgreSQL"],
      acceptanceCriteria: [
        "Normalized collections with foreign key references.",
        "Compound indices on frequent lookups to prevent duplicate applications or task entries."
      ]
    },
    {
      id: "feat-3",
      title: "Interactive Collaboration Workspace",
      description: "Centralized hub uniting live Kanban boards, team discussions, and markdown notes.",
      priority: "MUST_HAVE",
      phase: "MVP",
      suggestedSkills: ["React", "Tailwind CSS", "Framer Motion"],
      acceptanceCriteria: [
        "Kanban board supports drag-and-drop state transitions between TODO, IN_PROGRESS, and DONE.",
        "Team members can create, edit, and read persistent project notes."
      ]
    },
    {
      id: "feat-4",
      title: "Automated Integration & Webhook Sync",
      description: "Event-driven webhooks syncing Git commits and PR closures directly to project tasks.",
      priority: "SHOULD_HAVE",
      phase: "MVP",
      suggestedSkills: ["Node.js", "REST APIs", "Webhooks"],
      acceptanceCriteria: [
        "Commits matching 'Fixes #<taskId>' automatically move the corresponding task to DONE.",
        "Bot messages are dispatched to team chat upon pull request merges."
      ]
    },
    {
      id: "feat-5",
      title: "Advanced Analytics & Gamification Engine",
      description: "Telemetry tracking contributor velocity, milestones, and automated reputation badges.",
      priority: "NICE_TO_HAVE",
      phase: "V2",
      suggestedSkills: ["Data Viz", "TypeScript"],
      acceptanceCriteria: [
        "Points awarded automatically on project completion and peer endorsements.",
        "Leaderboard dynamically updates without requiring full-page reloads."
      ]
    }
  ];

  const techStack: IPRDTechStack[] = [
    {
      category: "Frontend Framework",
      technology: "Next.js 16 (App Router) + React 19",
      reasoning: "Server Components provide ultra-fast initial loads and zero-bundle server logic."
    },
    {
      category: "Styling & UI Components",
      technology: "Tailwind CSS v4 + Radix UI Primitives",
      reasoning: "Headless, accessible component foundation with flexible design tokens."
    },
    {
      category: "Database & ORM",
      technology: "MongoDB via Mongoose",
      reasoning: "Flexible document model with strict schema validation and connection caching."
    },
    {
      category: "Authentication",
      technology: "NextAuth.js v5 (JWT Strategy)",
      reasoning: "Hardened credential validation and extensible session management."
    }
  ];

  const apiEndpoints: IPRDApiEndpoint[] = [
    {
      method: "GET",
      path: "/api/projects/:id",
      description: "Retrieve complete project specifications, team members, and health status."
    },
    {
      method: "POST",
      path: "/api/teams/tasks",
      description: "Create a new Kanban task assigned to a collaborator."
    },
    {
      method: "POST",
      path: "/api/teams/messages",
      description: "Post a real-time message to the project workspace chat channel."
    },
    {
      method: "POST",
      path: "/api/webhooks/github",
      description: "Receive push/PR events to automatically mark linked tasks as completed."
    }
  ];

  const milestones: GeneratedMilestone[] = getDefaultMilestones({ title, domain });

  const sanitizedTitle = title.replace(/[^a-zA-Z0-9 ]/g, "");

  const mindmapMermaid = `mindmap
  root(("${sanitizedTitle}"))
    Core Architecture
      Next.js App Router
      MongoDB Mongoose
      NextAuth JWT
    MVP Features
      Authentication
      Kanban Tasks
      Team Workspace
      Shared Notes
    Integrations
      GitHub Webhooks
      AI PRD Generator
      Automated Cron Workers
    V2 Roadmap
      Real-time WebSockets
      Native Video Calls
      AI Code Reviewer`;

  const architectureMermaid = `graph TD
    Client[Client Browser / React UI] -->|HTTPS Requests| Router[Next.js App Router]
    Router -->|Server Actions| ActionLayer[Business Logic Layer]
    Router -->|API Route Handlers| APILayer[REST Endpoints]
    ActionLayer --> DBPool[Mongoose Connection Pool]
    APILayer --> DBPool
    DBPool --> DB[(MongoDB Database)]
    GitHub[GitHub Webhook API] -->|HMAC Verified Push| APILayer`;

  const erDiagramMermaid = `erDiagram
    PROJECT ||--o{ TASK : contains
    PROJECT ||--o{ TEAM_MEMBER : has
    USER ||--o{ TEAM_MEMBER : participates
    USER ||--o{ TASK : assigned_to
    PROJECT ||--o{ MESSAGE : stores
    USER ||--o{ MESSAGE : writes`;

  const rawData: GeneratedPRDData = {
    title,
    overview: {
      summary: input.description.trim() || `A high-performance ${domain} platform engineered for agile execution and collaborative teamwork.`,
      problemStatement: input.problemStatement.trim() || `Addresses fragmentation and high setup friction in modern ${domain} development workflows.`,
      targetAudience: [
        "Product Engineers and Builders",
        "Open-source Contributors and Hackathon Teams",
        "Technical Founders and Agile Product Managers"
      ],
      successMetrics: [
        "Deploy a functioning MVP within the first 14-day development sprint.",
        "Achieve 100% test pass rate across core API routes.",
        "Zero unhandled runtime errors in production telemetry."
      ]
    },
    features,
    techStack,
    apiEndpoints,
    milestones,
    diagrams: {
      mindmapMermaid,
      architectureMermaid,
      erDiagramMermaid
    },
    rawMarkdown: ""
  };

  rawData.rawMarkdown = formatPRDToMarkdown(rawData);
  return rawData;
}

export function formatPRDToMarkdown(prd: Partial<GeneratedPRDData>): string {
  let md = `# 📄 Product Requirements Document: ${prd.title || "Project Specification"}\n\n`;

  if (prd.overview) {
    md += `## 1. Overview & Problem Statement\n\n`;
    md += `### Executive Summary\n${prd.overview.summary || "N/A"}\n\n`;
    md += `### Problem Statement\n${prd.overview.problemStatement || "N/A"}\n\n`;

    if (prd.overview.targetAudience?.length) {
      md += `### Target Audience\n`;
      prd.overview.targetAudience.forEach((a) => {
        md += `* ${a}\n`;
      });
      md += `\n`;
    }

    if (prd.overview.successMetrics?.length) {
      md += `### Success Metrics\n`;
      prd.overview.successMetrics.forEach((m) => {
        md += `* 🎯 ${m}\n`;
      });
      md += `\n`;
    }
  }

  if (prd.features?.length) {
    md += `## 2. Feature Specifications & User Stories\n\n`;
    prd.features.forEach((f, idx) => {
      md += `### 2.${idx + 1} ${f.title} (${f.priority || "MUST_HAVE"} · ${f.phase || "MVP"})\n`;
      md += `${f.description}\n\n`;
      if (f.acceptanceCriteria?.length) {
        md += `**Acceptance Criteria:**\n`;
        f.acceptanceCriteria.forEach((ac) => {
          md += `- [ ] ${ac}\n`;
        });
        md += `\n`;
      }
      if (f.suggestedSkills?.length) {
        md += `**Required Skills:** \`${f.suggestedSkills.join("`, `")}\`\n\n`;
      }
    });
  }

  if (prd.techStack?.length) {
    md += `## 3. Recommended Technical Stack\n\n`;
    md += `| Category | Technology | Architecture Rationale |\n`;
    md += `| :--- | :--- | :--- |\n`;
    prd.techStack.forEach((t) => {
      md += `| **${t.category}** | \`${t.technology}\` | ${t.reasoning} |\n`;
    });
    md += `\n`;
  }

  if (prd.apiEndpoints?.length) {
    md += `## 4. API Endpoints Contract\n\n`;
    md += `| Method | Endpoint Path | Description |\n`;
    md += `| :--- | :--- | :--- |\n`;
    prd.apiEndpoints.forEach((api) => {
      md += `| \`${api.method}\` | \`${api.path}\` | ${api.description} |\n`;
    });
    md += `\n`;
  }

  if (prd.milestones?.length) {
    md += `## 5. Development Roadmap & Sprints\n\n`;
    prd.milestones.forEach((m, idx) => {
      md += `### Sprint ${m.order || idx + 1}: ${m.title} (Target: Day ${m.targetDays || (idx + 1) * 7})\n`;
      md += `${m.description}\n\n`;
      if (m.deliverables?.length) {
        md += `**Sprint Deliverables:**\n`;
        m.deliverables.forEach((d) => {
          md += `- [ ] ${d}\n`;
        });
        md += `\n`;
      }
    });
  }

  return md;
}
