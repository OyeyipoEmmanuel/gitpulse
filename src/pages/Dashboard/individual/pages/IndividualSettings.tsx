import { useState } from "react"
import { AlertTriangle, GitBranch, LoaderCircle, LockKeyhole, Trash2, Unplug } from "lucide-react"
import { performAccountAction, type AccountAction } from "@/lib/accountActions"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function IndividualSettings() {
  const { user, tokenStatus, signOut } = useAuthStore()
  const [action, setAction] = useState<AccountAction | null>(null)
  const [confirmation, setConfirmation] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const username = user?.user_metadata.user_name || user?.user_metadata.preferred_username || "GitHub user"
  const avatar = user?.user_metadata.avatar_url as string | undefined
  const deleting = action === "delete-account"

  const openConfirmation = (nextAction: AccountAction) => {
    setError(null)
    setConfirmation("")
    setAction(nextAction)
  }

  const runAction = async () => {
    if (!action || busy || (deleting && confirmation !== "DELETE")) return
    setBusy(true)
    setError(null)
    try {
      await performAccountAction(action)
      await signOut()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The account action could not be completed.")
      setAction(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-65px)] bg-background px-4 py-4 text-foreground">
      <div className="mx-auto">
        <div className="">
          <p className="mt-3 leading-7 text-muted-foreground">Manage your GitHub connection and control what GitPulse keeps.</p>
        </div>

        {error && <div role="alert" className="mt-7 flex items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive"><AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><p>{error}</p></div>}

        <Card className="mt-9">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-3"><GitBranch aria-hidden="true" className="size-5" />Connected accounts</CardTitle>
            <CardDescription>Services currently authorized to provide your analytics.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {avatar ? <img src={avatar} alt="" className="size-12 rounded-xl border" /> : <div className="flex size-12 items-center justify-center rounded-xl bg-muted"><GitBranch aria-hidden="true" /></div>}
              <div className="min-w-0"><p className="font-semibold">GitHub</p><p className="mt-1 truncate text-sm text-muted-foreground">@{username}</p></div>
              <Badge variant="secondary">{tokenStatus === "ready" ? "Connected" : "Needs attention"}</Badge>
            </div>
            <Button type="button" variant="outline" size="lg" onClick={() => openConfirmation("disconnect")}><Unplug aria-hidden="true" />Disconnect GitHub</Button>
          </CardContent>
        </Card>

        <Card className="mt-7 ring-destructive/25">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-destructive"><LockKeyhole aria-hidden="true" className="size-5" />Danger zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Separator className="mb-5 bg-destructive/15" />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl"><h3 className="font-semibold">Delete GitPulse account</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Permanently delete your account, revoke GitHub access and remove your stored credentials.</p></div>
              <Button type="button" variant="destructive" size="lg" onClick={() => openConfirmation("delete-account")}><Trash2 aria-hidden="true" />Delete account</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={action !== null} onOpenChange={open => { if (!open && !busy) setAction(null) }}>
        <AlertDialogContent className="border border-border bg-popover">
          <AlertDialogHeader>
            <AlertDialogMedia className={deleting ? "text-destructive" : "text-foreground"}>{deleting ? <Trash2 aria-hidden="true" /> : <Unplug aria-hidden="true" />}</AlertDialogMedia>
            <AlertDialogTitle>{deleting ? "Delete your GitPulse account?" : "Disconnect GitHub?"}</AlertDialogTitle>
            <AlertDialogDescription>{deleting ? "This permanently removes your GitPulse account and stored GitHub credentials. This action cannot be undone." : "GitPulse will revoke its GitHub authorization, remove your stored access token and sign you out. You can reconnect later."}</AlertDialogDescription>
          </AlertDialogHeader>
          {deleting && <label className="text-sm font-medium">Type <strong>DELETE</strong> to confirm<Input autoFocus value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={busy} className="mt-2" placeholder="DELETE" /></label>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <Button type="button" variant={deleting ? "destructive" : "default"} disabled={busy || (deleting && confirmation !== "DELETE")} onClick={event => { event.preventDefault(); void runAction() }}>
              {busy && <LoaderCircle aria-hidden="true" className="animate-spin" />}{busy ? "Working…" : deleting ? "Permanently delete account" : "Disconnect GitHub"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
