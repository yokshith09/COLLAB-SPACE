export interface IdeaEvaluationResult {
  overallScore: number;
  verdict: string;
  verdictTone: "success" | "warning" | "info" | "destructive";
  dimensions: {
    problemClarity: { score: number; feedback: string };
    mvpScope: { score: number; feedback: string };
    technicalMoat: { score: number; feedback: string };
    teamAttractiveness: { score: number; feedback: string };
    marketNeed: { score: number; feedback: string };
  };
  critique: string;
  recommendations: string[];
  enhancedPitch: {
    title: string;
    description: string;
    problemStatement: string;
    suggestedSkills: string[];
  };
}

export async function evaluateProjectIdea(input: {
  title: string;
  description: string;
  problemStatement: string;
  domain?: string;
  requiredSkills?: string[];
}): Promise<IdeaEvaluationResult> {
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
                    text: `You are an elite Silicon Valley Tech Lead and Y-Combinator project mentor.
Analyze the following project idea submission and evaluate it against our 5-dimension framework:
1. Problem Clarity & Pain Point (1-10)
2. MVP Scope & Feasibility (1-10)
3. Technical Moat & Innovation (1-10)
4. Team & Contributor Attractiveness (1-10)
5. Market Need & Traction Path (1-10)

Project Details:
Title: "${input.title}"
Domain: "${input.domain || 'General Tech'}"
Description: "${input.description}"
Problem Statement: "${input.problemStatement}"
Required Skills: ${JSON.stringify(input.requiredSkills || [])}

You must respond ONLY with a valid, clean JSON object matching this exact schema:
{
  "overallScore": number (0-100),
  "verdict": string (e.g., "Exceptional MVP", "Strong Potential", "Promising with Refinements", "Scope Needs Focus"),
  "verdictTone": "success" | "warning" | "info" | "destructive",
  "dimensions": {
    "problemClarity": { "score": number (1-10), "feedback": string },
    "mvpScope": { "score": number (1-10), "feedback": string },
    "technicalMoat": { "score": number (1-10), "feedback": string },
    "teamAttractiveness": { "score": number (1-10), "feedback": string },
    "marketNeed": { "score": number (1-10), "feedback": string }
  },
  "critique": string (2-3 sentences of blunt, constructive reality-check highlighting potential blind spots or over-engineering),
  "recommendations": [
    string (concrete action item 1),
    string (concrete action item 2),
    string (concrete action item 3)
  ],
  "enhancedPitch": {
    "title": string (refined catchy, clear title),
    "description": string (polished, high-converting summary),
    "problemStatement": string (sharp, unambiguous problem breakdown),
    "suggestedSkills": [string] (4-6 most relevant skills)
  }
}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return parsed as IdeaEvaluationResult;
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to heuristic engine:", err);
    }
  }

  // Resilient heuristic engine (guarantees fast, contextual evaluation even without API keys)
  return generateHeuristicEvaluation(input);
}

function generateHeuristicEvaluation(input: {
  title: string;
  description: string;
  problemStatement: string;
  domain?: string;
  requiredSkills?: string[];
}): IdeaEvaluationResult {
  const descLen = (input.description || "").trim().length;
  const probLen = (input.problemStatement || "").trim().length;
  const skillsCount = (input.requiredSkills || []).length;
  const domain = input.domain || "Web Dev";

  // Score calculations
  let problemScore = Math.min(10, Math.max(5, Math.round(5 + (probLen > 60 ? 3 : 1) + (probLen > 150 ? 2 : 0))));
  let scopeScore = Math.min(10, Math.max(4, Math.round(8 - (skillsCount > 6 ? 3 : 0) + (descLen < 300 ? 2 : -1))));
  let moatScore = Math.min(10, Math.max(5, Math.round(6 + (domain === "AI/ML" || domain === "Blockchain" ? 2 : 1))));
  let teamScore = Math.min(10, Math.max(6, Math.round(6 + (skillsCount >= 2 && skillsCount <= 5 ? 3 : 1))));
  let marketScore = Math.min(10, Math.max(5, Math.round(6 + (descLen > 80 ? 2 : 0))));

  const overallScore = Math.round(
    (problemScore * 2.5 + scopeScore * 2.5 + moatScore * 2.0 + teamScore * 1.5 + marketScore * 1.5)
  );

  let verdict = "Strong Potential";
  let verdictTone: "success" | "warning" | "info" | "destructive" = "info";

  if (overallScore >= 85) {
    verdict = "Exceptional MVP Ready";
    verdictTone = "success";
  } else if (overallScore >= 70) {
    verdict = "Strong Potential with Minor Tweaks";
    verdictTone = "info";
  } else if (overallScore >= 55) {
    verdict = "Promising - Needs Sharper Scope";
    verdictTone = "warning";
  } else {
    verdict = "Needs Refinement & Target Definition";
    verdictTone = "destructive";
  }

  // Refined pitch generation
  const cleanTitle = input.title.trim() || "Untitled Collaboration Project";
  const enhancedTitle = cleanTitle.length < 15 ? `${cleanTitle} - Modern ${domain} Platform` : cleanTitle;

  const refinedDescription = input.description.length > 30
    ? `${input.description.trim()}\n\nKey Focus: Delivering a production-grade MVP featuring modular architecture, seamless user onboarding, and measurable team milestones.`
    : `A specialized ${domain} project focused on building an intuitive, scalable solution that addresses critical workflow friction. Engineered for rapid iteration and community collaboration.`;

  const refinedProblemStatement = input.problemStatement.length > 20
    ? `${input.problemStatement.trim()}\n\nTarget Impact: Eliminating fragmented tooling and manual context-switching for modern teams.`
    : `Modern builders and users experience significant inefficiencies due to fragmented solutions and high learning curves in the ${domain} space. This project provides a unified, frictionless alternative.`;

  const suggestedSkills = Array.from(
    new Set([
      ...(input.requiredSkills || []),
      "TypeScript",
      "React",
      domain === "AI/ML" ? "Python" : domain === "Blockchain" ? "Solidity" : "Node.js",
      "MongoDB",
      "Tailwind CSS",
    ])
  ).slice(0, 5);

  return {
    overallScore,
    verdict,
    verdictTone,
    dimensions: {
      problemClarity: {
        score: problemScore,
        feedback: probLen > 80 ? "Well-defined problem context." : "Problem statement could be more specific regarding exact user pain points."
      },
      mvpScope: {
        score: scopeScore,
        feedback: skillsCount > 6 ? "High skill count may indicate overly broad initial MVP scope." : "Achievable scope for an agile team sprint."
      },
      technicalMoat: {
        score: moatScore,
        feedback: `Strong alignment with the ${domain} ecosystem.`
      },
      teamAttractiveness: {
        score: teamScore,
        feedback: "Clear stack breakdown that developers will find motivating to contribute to."
      },
      marketNeed: {
        score: marketScore,
        feedback: "Addresses a genuine market gap with a clear path to early adopter traction."
      }
    },
    critique: `The project has clear potential in the ${domain} domain. Ensure you strictly define your MVP boundaries to ship a working prototype within the first 3 weeks before expanding secondary features.`,
    recommendations: [
      "Define 1 core metric for MVP success (e.g. 50 active beta testers in week 1).",
      "Highlight the primary database schema and authentication flow in your initial PRD.",
      "Assign explicit role ownership (Frontend Lead, Backend/DB Lead) to attract targeted contributors."
    ],
    enhancedPitch: {
      title: enhancedTitle,
      description: refinedDescription,
      problemStatement: refinedProblemStatement,
      suggestedSkills
    }
  };
}
