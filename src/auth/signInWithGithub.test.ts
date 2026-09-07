import { afterEach, describe, expect, it, vi } from "vitest"
import { signInWithGithub } from "./signInWithGithub"

const oauth = vi.hoisted(() => vi.fn())
vi.mock("../lib/supabase", () => ({ supabase: { auth: { signInWithOAuth: oauth } } }))
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); oauth.mockReset() })

describe("GitHub OAuth initiation", () => {
  it("requests read scopes without repository write permission", async () => {
    vi.stubEnv("VITE_APP_URL", "https://gitpulse.example/")
    oauth.mockResolvedValue({ error: null })
    await signInWithGithub()
    expect(oauth).toHaveBeenCalledExactlyOnceWith({ provider: "github", options: {
      redirectTo: "https://gitpulse.example/auth/callback", scopes: "read:user user:email read:org",
    } })
  })
  it("uses the current origin when no app URL is configured", async () => {
    vi.stubEnv("VITE_APP_URL", "")
    vi.stubGlobal("window", { location: { origin: "http://localhost:5173" } })
    oauth.mockResolvedValue({ error: null })
    await signInWithGithub()
    expect(oauth.mock.calls[0][0].options.redirectTo).toBe("http://localhost:5173/auth/callback")
  })
  it("reports initiation failures without exposing provider error details", async () => {
    vi.stubEnv("VITE_APP_URL", "https://gitpulse.example")
    oauth.mockResolvedValue({ error: new Error("private provider details") })
    await expect(signInWithGithub()).rejects.toThrow("GitHub sign-in could not be started")
  })
})
