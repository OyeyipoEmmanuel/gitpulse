interface GradeCalculator {
  totalScore: number;
  grade: string | null;
  color: string | null;
}

const GRADE_COLORS: Record<string, string> = {
  A: "#238636", // green
  B: "#1F6FEB", // blue
  C: "#EAB308", // yellow
  D: "#F97316", // orange
  E: "#EF4444", // red
  F: "#7D8590", // gray
};

export const gradeCalculator = (scores: number[]): GradeCalculator | null => {

  if (scores.length == 0) return null;

  const totalScore = scores.reduce((acc, r) => acc + r, 0) / scores.length;

  let grade: "A" | "B" | "C" | "D" | "E" | "F" | null = null;

  if (totalScore >= 80) grade = "A";
  else if (totalScore >= 65) grade = "B";
  else if (totalScore >= 50) grade = "C";
  else if (totalScore >= 40) grade = "D";
  else if (totalScore >= 30) grade = "E";
  else if (totalScore < 30) grade = "F";
  else grade = null;

  return {
    totalScore,
    grade,
    color: grade ? GRADE_COLORS[grade] : null,
  };
};
