import type { CodeQualityNode, CollaborationQuery, OpenSourceNode, ReportCardDimesions, RepositoryNode } from "../types"
import { average, percentage } from "./analyticsCalculator"
import { gradeCalculator } from "./gradeCalculator"

export function codeQualityDimension(data: CodeQualityNode[], repos: RepositoryNode[]): ReportCardDimesions {
  const totalLines = data.reduce((total, pullRequest) => total + pullRequest.additions + pullRequest.deletions, 0)
  const averageSize = average(totalLines, data.length)
  const mergedCount = data.filter(pullRequest => pullRequest.state === "MERGED").length
  const mergeRate = percentage(mergedCount, data.length)
  const totalPullRequests = repos.reduce((total, repo) => total + repo.pullRequests.totalCount, 0)
  const averagePerRepo = average(totalPullRequests, repos.length)
  const grade = mergeRate === null ? null : gradeCalculator([mergeRate])

  return {
    label: "Code Quality",
    grade: grade?.grade,
    gradeColor: grade?.color,
    gradeScore: grade?.totalScore ?? null,
    stats: {
      "Avg Pr Size": averageSize === null ? "Unavailable" : `${averageSize.toFixed(0)} lines`,
      "PR Merge Rate": mergeRate === null ? "Unavailable" : `${mergeRate.toFixed(0)}%`,
      "Avg PRs per repo": averagePerRepo === null ? "Unavailable" : Math.round(averagePerRepo),
    },
  }
}

export function consistencyDimension(
  currentStreak: number,
  consistency: { score: number | null; remark: string; color: string },
  activityByDay: { day: string; contributions: number }[],
): ReportCardDimesions {
  const mostActiveDay = activityByDay.reduce<typeof activityByDay[number] | null>(
    (highest, day) => !highest || day.contributions > highest.contributions ? day : highest,
    null,
  )
  const grade = consistency.score === null ? null : gradeCalculator([consistency.score])

  return {
    label: "Consistency",
    grade: grade?.grade,
    gradeColor: grade?.color,
    gradeScore: grade?.totalScore ?? null,
    stats: {
      "Current Streak": consistency.score === null ? "Unavailable" : `${currentStreak} days`,
      "Consistency Score": consistency.score === null ? "Unavailable" : `${consistency.score}%`,
      "Most Active Day": consistency.score === null ? "Unavailable" : mostActiveDay?.day ?? "Unavailable",
    },
  }
}

export function collaborationDimension(collaboration: CollaborationQuery, mergedPullRequests: OpenSourceNode[], username: string): ReportCardDimesions {
  const reviewsScore = Math.min((collaboration.totalCount / 10) * 100, 100)
  const externalPullRequests = mergedPullRequests.filter(node => node.repository.owner.login !== username)
  const externalRepositories = new Set(externalPullRequests.map(node => node.repository.nameWithOwner)).size
  const externalScore = Math.min((externalPullRequests.length / 5) * 100, 100)
  const grade = gradeCalculator([reviewsScore, externalScore])

  return {
    label: "Collaboration",
    grade: grade?.grade,
    gradeColor: grade?.color,
    gradeScore: grade?.totalScore ?? null,
    stats: {
      "PRs Reviewed": collaboration.totalCount,
      "External Repos": externalRepositories,
      "PRs in Others Repos": externalPullRequests.length,
    },
  }
}

export function openSourceDimension(data: OpenSourceNode[], username: string): ReportCardDimesions {
  const externalPullRequests = data.filter(node => node.repository.owner.login !== username)
  const externalRepositories = new Set(externalPullRequests.map(node => node.repository.nameWithOwner)).size
  const topRepository = externalPullRequests.reduce<OpenSourceNode | null>(
    (highest, node) => !highest || node.repository.stargazerCount > highest.repository.stargazerCount ? node : highest,
    null,
  )
  const grade = gradeCalculator([Math.min((externalPullRequests.length / 5) * 100, 100)])

  return {
    label: "Open Source",
    grade: grade?.grade,
    gradeColor: grade?.color,
    gradeScore: grade?.totalScore ?? null,
    stats: {
      "External Repos": externalRepositories,
      "PRs Merged": externalPullRequests.length,
      "Top Repo": topRepository?.repository.name ?? "—",
    },
  }
}

export function maintenanceDimension(data: RepositoryNode[]): ReportCardDimesions {
  const total = data.length
  const licensed = data.filter(repo => repo.licenseInfo !== null).length
  const withReadme = data.filter(repo => repo.object !== null).length
  const licenseCoverage = percentage(licensed, total)
  const readmeCoverage = percentage(withReadme, total)
  const grade = licenseCoverage === null || readmeCoverage === null
    ? null
    : gradeCalculator([Math.floor(licenseCoverage), Math.floor(readmeCoverage)])

  return {
    label: "Maintenance",
    grade: grade?.grade,
    gradeColor: grade?.color,
    gradeScore: grade?.totalScore ?? null,
    stats: {},
    bars: [
      { label: "README Coverage", value: withReadme, total },
      { label: "License Coverage", value: licensed, total },
    ],
  }
}
