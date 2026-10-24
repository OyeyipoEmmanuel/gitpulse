import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const defaultDescription = "Turn your GitHub activity into clear insights on productivity, repository health, collaboration, and developer growth.";

const pageDetails = (pathname: string) => {
  if (pathname === "/") return { title: "GitPulse — GitHub Analytics for Developers", description: defaultDescription, indexable: true };
  if (pathname === "/auth/callback") return { title: "Connecting GitHub | GitPulse", description: "Securely connecting your GitHub account to GitPulse." };
  if (pathname.endsWith("/select-account")) return { title: "Choose an Account | GitPulse", description: "Choose the GitHub account you want to explore in GitPulse." };
  if (pathname.endsWith("/repo-intelligence")) return { title: "Repository Intelligence | GitPulse", description: "Explore repository activity, health, and momentum." };
  if (pathname.endsWith("/productivity")) return { title: "Productivity Analytics | GitPulse", description: "Understand your GitHub contribution rhythm and consistency." };
  if (pathname.endsWith("/dev-report-card")) return { title: "Developer Report Card | GitPulse", description: "Review a focused report of your developer activity." };
  if (pathname.endsWith("/career-snapshot")) return { title: "Career Snapshot | GitPulse", description: "See your developer experience and impact at a glance." };
  if (pathname.endsWith("/ask-bob")) return { title: "Ask Bob | GitPulse", description: "Ask questions about your GitHub activity and developer journey." };
  if (pathname.endsWith("/settings")) return { title: "Settings | GitPulse", description: "Manage your GitPulse account and GitHub connection." };
  if (pathname.includes("/dashboard/org/")) return { title: "Organization Dashboard | GitPulse", description: "Explore organization activity with GitPulse." };
  if (pathname.endsWith("/profile")) return { title: "Developer Profile | GitPulse", description: "Explore your GitHub profile and developer activity." };
  return { title: "Page Not Found | GitPulse", description: "The page you requested could not be found." };
};

const setMeta = (name: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
};

export default function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const details = pageDetails(pathname);
    document.title = details.title;
    setMeta("description", details.description);
    setMeta("robots", details.indexable ? "index, follow" : "noindex, nofollow");
  }, [pathname]);

  return null;
}
