import { CheckCircle2, Edit, FileText, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface StyleProfile {
  id: string
  name: string
  personaPrompt: string
  isActive: boolean
  createdAt: string
  lastUsed?: string
}

export function StyleProfiles() {
  const [profiles, setProfiles] = useState<StyleProfile[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', personaPrompt: '' })

  const fetchProfiles = useCallback(async () => {
    try {
      const response = await fetch('/v1/style-profile')
      if (response.ok) {
        const data = await response.json()
        // Transform to array if single profile
        const profilesList = Array.isArray(data) ? data : data.personaPrompt ? [data] : []
        setProfiles(profilesList)
      }
    } catch (_error) {
      // Failed to fetch profiles - will show empty state
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
  }, [fetchProfiles])

  const handleSave = async () => {
    try {
      const response = await fetch('/v1/style-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        await fetchProfiles()
        setEditingId(null)
        setEditForm({ name: '', personaPrompt: '' })
      }
    } catch (_error) {
      // Failed to save profile
    }
  }

  const handleActivate = async (_id: string) => {
    // TODO: Implement activate endpoint
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Style Profiles</h1>
          <p className="text-muted-foreground">Manage your writing style personas</p>
        </div>
        <Button onClick={() => setEditingId('new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Profile
        </Button>
      </div>

      {/* Create/Edit Form */}
      {editingId && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId === 'new' ? 'Create New Profile' : 'Edit Profile'}</CardTitle>
            <CardDescription>Define your writing style and persona</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Profile Name
              </label>
              <Input
                id="name"
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="e.g., Technical Writer, Casual Blogger"
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="prompt" className="text-sm font-medium">
                Persona Prompt
              </label>
              <textarea
                id="prompt"
                value={editForm.personaPrompt}
                onChange={e => setEditForm({ ...editForm, personaPrompt: e.target.value })}
                placeholder="Describe the writing style, tone, and structure..."
                className="mt-1 flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setEditForm({ name: '', personaPrompt: '' })
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profiles List */}
      <div className="grid gap-4 md:grid-cols-2">
        {profiles.length === 0 ? (
          <Card className="col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                No style profiles yet. Create one to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          profiles.map(profile => (
            <Card key={profile.id} className={profile.isActive ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{profile.name || 'Unnamed Profile'}</CardTitle>
                  {profile.isActive && <Badge>Active</Badge>}
                </div>
                <CardDescription className="line-clamp-3">
                  {profile.personaPrompt || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {!profile.isActive && (
                    <Button size="sm" onClick={() => handleActivate(profile.id)}>
                      Activate
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setEditingId(profile.id)}>
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
