'use client';

import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Paperclip,
  Image as ImageIcon,
  Video,
  FileText,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { CannedResponse } from '@/types';
import { uploadAccountMedia, deleteAccountMedia } from '@/lib/storage/upload-media';
import { CHAT_MEDIA_BUCKET } from '@/components/inbox/message-composer';

export function CannedResponsesSettings() {
  const supabase = createClient();
  const { user, accountId, loading: authLoading, canEditSettings } = useAuth();

  const [loading, setLoading] = useState(true);
  const [cannedList, setCannedList] = useState<CannedResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCanned, setSelectedCanned] = useState<CannedResponse | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [shortcut, setShortcut] = useState('');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Delete Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cannedToDelete, setCannedToDelete] = useState<CannedResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !accountId) {
      loadedRef.current = null;
      setLoading(false);
      return;
    }
    if (loadedRef.current === accountId) return;
    loadedRef.current = accountId;
    fetchCannedResponses();
  }, [authLoading, user, accountId]);

  async function fetchCannedResponses() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('canned_responses')
        .select('*')
        .order('shortcut', { ascending: true });

      if (error) throw error;
      setCannedList(data || []);
    } catch (err) {
      console.error('Failed to fetch canned responses:', err);
      toast.error('Failed to load canned responses');
    } finally {
      setLoading(false);
    }
  }

  const filteredCanned = cannedList.filter(
    (c) =>
      c.shortcut.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddDialog = () => {
    if (!canEditSettings) {
      toast.error('You do not have permission to manage canned responses.');
      return;
    }
    setSelectedCanned(null);
    setShortcut('');
    setContent('');
    setMediaUrl('');
    setMediaFile(null);
    setDialogOpen(true);
  };

  const openEditDialog = (canned: CannedResponse) => {
    if (!canEditSettings) {
      toast.error('You do not have permission to manage canned responses.');
      return;
    }
    setSelectedCanned(canned);
    setShortcut(canned.shortcut);
    setContent(canned.content);
    setMediaUrl(canned.media_url || '');
    setMediaFile(null);
    setDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (16 MB cap)
    const limit = 16 * 1024 * 1024;
    if (file.size > limit) {
      toast.error('File size exceeds the 16 MB limit.');
      return;
    }

    setMediaFile(file);
    setUploadingMedia(true);
    try {
      const { publicUrl } = await uploadAccountMedia(CHAT_MEDIA_BUCKET, file);
      setMediaUrl(publicUrl);
      toast.success('Media uploaded successfully');
    } catch (err) {
      console.error('Media upload failed:', err);
      toast.error(err instanceof Error ? err.message : 'Media upload failed');
      setMediaFile(null);
    } finally {
      setUploadingMedia(false);
    }
  };

  const clearStagedMedia = () => {
    // If we uploaded a file in this session, try to GC it
    if (mediaFile && mediaUrl) {
      const pathSegment = mediaUrl.split('/').pop();
      if (pathSegment && accountId) {
        const fullPath = `account-${accountId}/${pathSegment}`;
        void deleteAccountMedia(CHAT_MEDIA_BUCKET, fullPath).catch(() => {});
      }
    }
    setMediaFile(null);
    setMediaUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateShortcut = (val: string) => {
    // lowercase alphanumeric with hyphens, no spaces, no slashes
    return val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .slice(0, 30);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shortcut.trim()) {
      toast.error('Shortcut is required');
      return;
    }
    if (!content.trim()) {
      toast.error('Content is required');
      return;
    }
    if (!accountId || !user) return;

    setSaving(true);
    try {
      const cleanShortcut = shortcut.replace(/^\//, '').trim().toLowerCase();
      
      if (selectedCanned) {
        // Update
        const { error } = await supabase
          .from('canned_responses')
          .update({
            shortcut: cleanShortcut,
            content: content.trim(),
            media_url: mediaUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedCanned.id);

        if (error) throw error;
        toast.success('Canned response updated');
      } else {
        // Create
        const { error } = await supabase.from('canned_responses').insert({
          account_id: accountId,
          organization_id: accountId, // 1-to-1 in SaaS transition
          shortcut: cleanShortcut,
          content: content.trim(),
          media_url: mediaUrl || null,
        });

        if (error) throw error;
        toast.success('Canned response created');
      }

      setDialogOpen(false);
      await fetchCannedResponses();
    } catch (err: any) {
      console.error('Save error:', err);
      if (err.code === '23505') {
        toast.error('A canned response with this shortcut already exists.');
      } else {
        toast.error('Failed to save canned response');
      }
    } finally {
      setSaving(false);
    }
  }

  const confirmDelete = (canned: CannedResponse) => {
    if (!canEditSettings) {
      toast.error('You do not have permission to manage canned responses.');
      return;
    }
    setCannedToDelete(canned);
    setDeleteDialogOpen(true);
  };

  async function handleDelete() {
    if (!cannedToDelete) return;
    setDeleting(true);
    try {
      // If there is media, try to GC it (best effort)
      if (cannedToDelete.media_url && accountId) {
        const pathSegment = cannedToDelete.media_url.split('/').pop();
        if (pathSegment) {
          const fullPath = `account-${accountId}/${pathSegment}`;
          void deleteAccountMedia(CHAT_MEDIA_BUCKET, fullPath).catch(() => {});
        }
      }

      const { error } = await supabase
        .from('canned_responses')
        .delete()
        .eq('id', cannedToDelete.id);

      if (error) throw error;
      toast.success('Canned response deleted');
      setDeleteDialogOpen(false);
      await fetchCannedResponses();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Failed to delete canned response');
    } finally {
      setDeleting(false);
      setCannedToDelete(null);
    }
  }

  const getMediaIcon = (url: string) => {
    const ext = url.split('.').pop()?.split('?')[0].toLowerCase() || '';
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
      return <ImageIcon className="h-4 w-4 shrink-0 text-amber-400" />;
    }
    if (['mp4', '3gp'].includes(ext)) {
      return <Video className="h-4 w-4 shrink-0 text-sky-400" />;
    }
    return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Canned Responses
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Save pre-defined text and media templates. Agents can trigger these instantly in chats by typing `/`.
          </CardDescription>
        </div>
        {canEditSettings && (
          <Button onClick={openAddDialog} className="shrink-0 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Plus className="h-4 w-4" />
            Add Shortcut
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by shortcut (e.g. price) or content..."
            className="pl-9 bg-muted/50 border-border/60 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredCanned.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-16 px-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No canned responses found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {searchQuery ? 'No shortcuts match your current filter.' : 'Create canned responses so agents can send replies faster.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCanned.map((canned) => (
              <div
                key={canned.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border/50 bg-muted/20 p-4 transition-all duration-200 hover:border-border hover:bg-muted/30 shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary border border-primary/10">
                      /{canned.shortcut}
                    </span>
                    {canned.media_url && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"
                        title="Contains media attachment"
                      >
                        {getMediaIcon(canned.media_url)}
                        Media
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/95 line-clamp-3 whitespace-pre-wrap break-words leading-relaxed font-medium">
                    {canned.content}
                  </p>
                </div>

                {canEditSettings && (
                  <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-border/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(canned)}
                      className="h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                      title="Edit response"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => confirmDelete(canned)}
                      className="h-8 px-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="Delete response"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-popover border-border text-popover-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-popover-foreground">
              {selectedCanned ? 'Edit Canned Response' : 'Add Canned Response'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Pre-defined shortcuts are active for all organization users.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shortcut name */}
            <div className="space-y-1.5">
              <Label htmlFor="shortcut-input" className="text-muted-foreground">
                Keyboard Shortcut
              </Label>
              <div className="relative">
                <span className="absolute top-2.5 left-3.5 text-sm font-semibold text-muted-foreground select-none">
                  /
                </span>
                <Input
                  id="shortcut-input"
                  value={shortcut}
                  onChange={(e) => setShortcut(validateShortcut(e.target.value))}
                  placeholder="price"
                  required
                  className="pl-6 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Lowercase alphanumeric and hyphens only (e.g. &quot;gst-num&quot;). No spaces or slashes.
              </p>
            </div>

            {/* Content text */}
            <div className="space-y-1.5">
              <Label htmlFor="content-input" className="text-muted-foreground">
                Message Content
              </Label>
              <Textarea
                id="content-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Hi! Our current price is..."
                rows={4}
                required
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Media Attachment */}
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Media Attachment (Optional)</Label>
              {mediaUrl ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted p-2.5">
                  <div className="flex items-center gap-2 text-xs truncate">
                    {getMediaIcon(mediaUrl)}
                    <span className="truncate text-foreground font-medium select-all">
                      {mediaUrl.split('/').pop() || 'Attachment'}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearStagedMedia}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/mp4,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingMedia}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    {uploadingMedia ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Upload Image/Video/PDF
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogOpen(false)}
                className="hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving || uploadingMedia}
                className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : selectedCanned ? (
                  'Save Changes'
                ) : (
                  'Add Response'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-popover border-border text-popover-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Canned Response?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete the shortcut <strong>/{cannedToDelete?.shortcut}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              disabled={deleting}
              onClick={() => setDeleteDialogOpen(false)}
              className="hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Delete Shortcut'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
