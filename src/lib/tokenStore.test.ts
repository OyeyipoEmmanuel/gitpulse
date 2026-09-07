import { beforeEach, describe, expect, it, vi } from "vitest"
import { getProviderToken, saveProviderToken } from "./tokenStore"

const chain = vi.hoisted(() => ({
  from: vi.fn(), select: vi.fn(), eq: vi.fn(), upsert: vi.fn(), abortSignal: vi.fn(), maybeSingle: vi.fn(),
}))
vi.mock("./supabase", () => ({ supabase: { from: chain.from } }))

describe("provider token persistence", () => {
  const signal = new AbortController().signal
  beforeEach(() => {
    vi.clearAllMocks()
    chain.from.mockReturnValue(chain)
    chain.select.mockReturnValue(chain)
    chain.eq.mockReturnValue(chain)
    chain.abortSignal.mockReturnValue(chain)
    chain.maybeSingle.mockResolvedValue({ data: null, error: null })
    chain.upsert.mockReturnValue({ abortSignal: vi.fn().mockResolvedValue({ error: null }) })
  })

  it("recovers only the requested user's token with cancellation", async () => {
    chain.maybeSingle.mockResolvedValue({ data: { github_access_token: "token" }, error: null })
    await expect(getProviderToken("a", signal)).resolves.toBe("token")
    expect(chain.from).toHaveBeenCalledWith("user_tokens")
    expect(chain.select).toHaveBeenCalledWith("github_access_token")
    expect(chain.eq).toHaveBeenCalledWith("user_id", "a")
    expect(chain.abortSignal).toHaveBeenCalledWith(signal)
  })
  it("distinguishes an absent token row from a database failure", async () => {
    await expect(getProviderToken("a", signal)).resolves.toBeNull()
    chain.maybeSingle.mockResolvedValue({ data: null, error: { message: "private database details" } })
    await expect(getProviderToken("a", signal)).rejects.toThrow("could not be loaded")
  })
  it("writes the token for its owner using the unique user_id key", async () => {
    await saveProviderToken("a", "token", signal)
    expect(chain.upsert).toHaveBeenCalledWith({ user_id: "a", github_access_token: "token", updated_at: expect.any(String) }, { onConflict: "user_id" })
    expect(chain.upsert.mock.results[0].value.abortSignal).toHaveBeenCalledWith(signal)
  })
  it("surfaces write failure rather than only logging it", async () => {
    chain.upsert.mockReturnValue({ abortSignal: vi.fn().mockResolvedValue({ error: { message: "denied" } }) })
    await expect(saveProviderToken("a", "token", signal)).rejects.toThrow("could not be saved")
  })
})
