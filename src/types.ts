import type { JSX } from "react";

//types for pricing card
export interface PricingData {
  header: string;
  price: number;
  duration: number; //in unit of month
  isAvailable: boolean;
  features: string[];
}

export interface DashboardNavCOntentType {
  label: string;
  path: string;
  icon: JSX.Element;
}

export interface ButtonProps {
  icon: JSX.Element;
  label: string;
  bgColor: string;
  textColor: string;
}

export interface GithubOrg {
  login: string;
  avatar_url: string;
  description: string | null;
  name: string;
}

export interface GithubRepo {
  name: string;
  description: string | null;
  owner: {
    avatar_url: string;
    name: string;
  };
}

export interface PinnedRepo {
  name: string;
  isPrivate: boolean;
  description: string | null;
  primaryLanguage: { name: string; color: string } | null;
  stargazerCount: number;
  forkCount: number;
}

export interface StarredRepo {
  name: string;
  description: string | null;
  owner: {
    avatar_url: string;
    name: string;
  };
}

export interface GithubEventPayload {
  ref?: string;
  ref_type?: string;
  action?: string;
  commits?: { message: string }[];
  pull_request?: { merged: boolean; title: string };
  forkee?: { full_name: string };
  issue?: { title: string };
  comment?: { body: string };
}

export interface GithubEvent {
  id: string;
  type: string;
  repo: { name: string };
  payload: GithubEventPayload;
  created_at: string;
}

export interface RepositoryNode {
  name: string;
  pushedAt: string;
  isArchived: boolean;
  diskUsage: number;
  stargazerCount: number;
  pullRequests: {totalCount: number}
  forkCount: number;
  primaryLanguage: { name: string; color?: string } | null;
  openIssues: { totalCount: number };
  openPRs: { totalCount: number };
  licenseInfo: { name: string } | null;
  updatedAt: string;
  languages: {
    edges: { size: number; node: { name: string; color: string } }[];
  };
  defaultBranchRef: {
    target: {
      committedDate: string;
      history: { totalCount: number };
    };
  } | null;
}

export interface StargazerEdge {
  starredAt: string;
}

export interface CompetencyLevelChartProps {
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  totalIssueContributions: number;
}

export interface YoYReview {
    user: {
        thisYear: {
            contributionCalendar : {totalContributions: number}
        },
        lastYear: {
            contributionCalendar : {totalContributions: number}
        },
    }
}

export interface ReportCardDimesions {
  label: string
  grade: string | null | undefined
  gradeColor: string | null | undefined
  stats: Record<string, string | number>
}

export interface CodeQualityNode{
  additions: number
  deletions: number
  state: "MERGED" | "CLOSED" | "OPEN", 
  repository : {name: string}
}
