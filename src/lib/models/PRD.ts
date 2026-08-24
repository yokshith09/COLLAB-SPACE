import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPRDFeature {
  id: string;
  title: string;
  description: string;
  priority: "MUST_HAVE" | "SHOULD_HAVE" | "NICE_TO_HAVE";
  phase: "MVP" | "V2" | "FUTURE";
  suggestedSkills: string[];
  acceptanceCriteria: string[];
}

export interface IPRDTechStack {
  category: string;
  technology: string;
  reasoning: string;
}

export interface IPRDApiEndpoint {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  description: string;
  payload?: string;
  response?: string;
}

export interface IPRD extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  title: string;
  version: number;
  overview: {
    summary: string;
    problemStatement: string;
    targetAudience: string[];
    successMetrics: string[];
  };
  features: IPRDFeature[];
  techStack: IPRDTechStack[];
  apiEndpoints: IPRDApiEndpoint[];
  diagrams: {
    mindmapMermaid: string;
    architectureMermaid: string;
    erDiagramMermaid: string;
  };
  rawMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

const PRDSchema = new Schema<IPRD>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
    title: { type: String, required: true },
    version: { type: Number, default: 1 },
    overview: {
      summary: { type: String, required: true },
      problemStatement: { type: String, required: true },
      targetAudience: [{ type: String }],
      successMetrics: [{ type: String }],
    },
    features: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        priority: { type: String, enum: ["MUST_HAVE", "SHOULD_HAVE", "NICE_TO_HAVE"], default: "MUST_HAVE" },
        phase: { type: String, enum: ["MVP", "V2", "FUTURE"], default: "MVP" },
        suggestedSkills: [{ type: String }],
        acceptanceCriteria: [{ type: String }],
      },
    ],
    techStack: [
      {
        category: { type: String, required: true },
        technology: { type: String, required: true },
        reasoning: { type: String, required: true },
      },
    ],
    apiEndpoints: [
      {
        method: { type: String, enum: ["GET", "POST", "PUT", "DELETE", "PATCH"], default: "GET" },
        path: { type: String, required: true },
        description: { type: String, required: true },
        payload: { type: String },
        response: { type: String },
      },
    ],
    diagrams: {
      mindmapMermaid: { type: String, default: "" },
      architectureMermaid: { type: String, default: "" },
      erDiagramMermaid: { type: String, default: "" },
    },
    rawMarkdown: { type: String, default: "" },
  },
  { timestamps: true }
);

export const PRD: Model<IPRD> = mongoose.models.PRD || mongoose.model<IPRD>("PRD", PRDSchema);
