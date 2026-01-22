"use client";

import React, { useState, useCallback, useRef, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Video, 
  Link2, 
  Calendar as CalendarIcon, 
  Send,
  Clock,
  Loader2,
  X,
  Globe,
  Trash2,
  ExternalLink,
  Plus,
  AlertTriangle,
  Linkedin,
  Facebook,
  Instagram,
  LinkIcon
} from "lucide-react";
import { LinkedInPreview } from "./previews/LinkedInPreview";
import { XPreview } from "./previews/XPreview";
import { FacebookPreview } from "./previews/FacebookPreview";
import { InstagramPreview } from "./previews/InstagramPreview";

// Types
interface PostContent {
  text: string;
  media: string[];
  mediaType?: "image" | "video";
  linkUrl?: string;
  linkPreview?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

interface PlatformPost extends PostContent {
  isOverridden: boolean;
}

interface PostsState {
  master: PostContent;
  linkedin: PlatformPost;
  x: PlatformPost;
  facebook: PlatformPost;
  instagram: PlatformPost;
}

type Platform = "master" | "linkedin" | "x" | "facebook" | "instagram";

interface AccountStatus {
  linkedin: boolean;
  x: boolean;
  facebook: boolean;
  instagram: boolean;
}

interface SocialComposerProps {
  connectedAccounts?: Array<{
    id: string;
    platform: string;
    platform_username?: string;
    ownership: string;
  }>;
  accountStatus?: AccountStatus;
  onPublish?: (posts: PostsState, scheduledDate?: Date) => Promise<void>;
  onSaveDraft?: (posts: PostsState) => Promise<void>;
}

const PLATFORM_INFO: Record<Platform, { name: string; charLimit: number; color: string; icon: React.ReactNode }> = {
  master: { 
    name: "All Platforms", 
    charLimit: 280, 
    color: "#6366f1",
    icon: <Globe className="w-4 h-4" />
  },
  linkedin: { 
    name: "LinkedIn", 
    charLimit: 3000, 
    color: "#0A66C2",
    icon: <Linkedin className="w-4 h-4" />
  },
  x: { 
    name: "X", 
    charLimit: 280, 
    color: "#000000",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  facebook: { 
    name: "Facebook", 
    charLimit: 63206, 
    color: "#1877F2",
    icon: <Facebook className="w-4 h-4" />
  },
  instagram: { 
    name: "Instagram", 
    charLimit: 2200, 
    color: "#E4405F",
    icon: <Instagram className="w-4 h-4" />
  },
};

const initialPostsState: PostsState = {
  master: { text: "", media: [] },
  linkedin: { text: "", media: [], isOverridden: false },
  x: { text: "", media: [], isOverridden: false },
  facebook: { text: "", media: [], isOverridden: false },
  instagram: { text: "", media: [], isOverridden: false },
};

// Default account status (for demo - can be overridden via props)
const DEFAULT_ACCOUNT_STATUS: AccountStatus = {
  linkedin: true,
  x: false,
  facebook: false,
  instagram: true,
};

export function SocialComposer({ 
  connectedAccounts = [], 
  accountStatus: propAccountStatus,
  onPublish, 
  onSaveDraft 
}: SocialComposerProps) {
  // Derive account status from connectedAccounts prop if available, otherwise use default
  const accountStatus = useMemo(() => {
    if (propAccountStatus) return propAccountStatus;
    
    // If connectedAccounts is provided, derive status from it
    if (connectedAccounts.length > 0) {
      return {
        linkedin: connectedAccounts.some(a => a.platform === 'linkedin'),
        x: connectedAccounts.some(a => a.platform === 'x' || a.platform === 'twitter'),
        facebook: connectedAccounts.some(a => a.platform === 'facebook'),
        instagram: connectedAccounts.some(a => a.platform === 'instagram'),
      };
    }
    
    return DEFAULT_ACCOUNT_STATUS;
  }, [propAccountStatus, connectedAccounts]);

  const [posts, setPosts] = useState<PostsState>(initialPostsState);
  const [activeTab, setActiveTab] = useState<Platform>("master");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkInput, setLinkInput] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("inspiring");
  const [aiAction, setAiAction] = useState<"improve" | "shorter" | "longer" | "emojis" | "hashtags" | "rewrite">("improve");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File input refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Get disconnected platforms for warning message
  const disconnectedPlatforms = useMemo(() => {
    const platforms: Exclude<Platform, "master">[] = ["linkedin", "x", "facebook", "instagram"];
    return platforms.filter(p => !accountStatus[p]);
  }, [accountStatus]);

  // Check if current platform is connected
  const isCurrentPlatformConnected = activeTab === "master" || accountStatus[activeTab as keyof AccountStatus];

  // The critical "Sync" Logic
  const handleContentChange = useCallback((platform: Platform, newText: string) => {
    setPosts((prev) => {
      const newState = { ...prev };

      if (platform === "master") {
        newState.master = { ...prev.master, text: newText };
        const platforms: Exclude<Platform, "master">[] = ["linkedin", "x", "facebook", "instagram"];
        platforms.forEach((p) => {
          if (!prev[p].isOverridden) {
            newState[p] = { ...prev[p], text: newText };
          }
        });
      } else {
        // Only mark as overridden if the text is actually different from master
        const isDifferentFromMaster = newText !== prev.master.text;
        newState[platform] = {
          ...prev[platform],
          text: newText,
          isOverridden: isDifferentFromMaster,
        };
      }

      return newState;
    });
  }, []);

  // Handle media change (sync to all platforms)
  const handleMediaChange = useCallback((mediaUrls: string[], mediaType: "image" | "video") => {
    setPosts((prev) => {
      const newState = { ...prev };
      newState.master = { ...prev.master, media: mediaUrls, mediaType };
      
      const platforms: Exclude<Platform, "master">[] = ["linkedin", "x", "facebook", "instagram"];
      platforms.forEach((p) => {
        newState[p] = { ...prev[p], media: mediaUrls, mediaType };
      });
      
      return newState;
    });
  }, []);

  // Handle link change (sync to all platforms)
  const handleLinkChange = useCallback((linkUrl: string, linkPreview?: PostContent["linkPreview"]) => {
    setPosts((prev) => {
      const newState = { ...prev };
      newState.master = { ...prev.master, linkUrl, linkPreview };
      
      const platforms: Exclude<Platform, "master">[] = ["linkedin", "x", "facebook", "instagram"];
      platforms.forEach((p) => {
        newState[p] = { ...prev[p], linkUrl, linkPreview };
      });
      
      return newState;
    });
  }, []);

  // Reset platform to master content
  const resetToMaster = useCallback((platform: Exclude<Platform, "master">) => {
    setPosts((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        text: prev.master.text,
        media: prev.master.media,
        mediaType: prev.master.mediaType,
        linkUrl: prev.master.linkUrl,
        linkPreview: prev.master.linkPreview,
        isOverridden: false,
      },
    }));
  }, []);

  // File upload handler
  const handleFileUpload = async (file: File, type: "image" | "video") => {
    console.log("Starting upload:", { name: file.name, size: file.size, type: file.type });
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    try {
      const response = await fetch("/api/admin/social/upload-media", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Upload response:", { status: response.status, result });

      if (!response.ok) {
        throw new Error(result.error || result.details?.[0] || "Upload failed");
      }

      if (result.url) {
        handleMediaChange([...posts.master.media, result.url], type);
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // Image input change handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Image input changed, files:", e.target.files);
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected image file:", file.name, file.size, file.type);
      handleFileUpload(file, "image");
    } else {
      console.log("No file selected");
    }
    e.target.value = "";
  };

  // Video input change handler
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, "video");
    }
    e.target.value = "";
  };

  // Remove media
  const handleRemoveMedia = (index: number) => {
    const newMedia = posts.master.media.filter((_, i) => i !== index);
    handleMediaChange(newMedia, posts.master.mediaType || "image");
  };

  // Add link with OG preview
  const handleAddLink = async () => {
    if (!linkInput.trim()) return;
    
    let url = linkInput.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    try {
      const response = await fetch(`/api/og-preview?url=${encodeURIComponent(url)}`);
      const preview = await response.json();
      
      handleLinkChange(url, {
        title: preview.title,
        description: preview.description,
        image: preview.image,
      });
    } catch (error) {
      handleLinkChange(url);
    }

    setLinkInput("");
    setIsLinkDialogOpen(false);
  };

  // Remove link
  const handleRemoveLink = () => {
    handleLinkChange("", undefined);
  };

  // AI Generation
  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) return;
    
    setIsGenerating(true);
    try {
      // Build the prompt based on whether we're revising or generating new
      const isRevising = currentContent.text.trim() && aiTopic === currentContent.text;
      let prompt = aiTopic;
      
      if (isRevising) {
        // Add action-specific instructions
        const actionPrompts: Record<string, string> = {
          improve: `Improve this social media post while keeping the same message. Make it more engaging and compelling:\n\n${aiTopic}`,
          shorter: `Make this social media post shorter and more concise while keeping the key message:\n\n${aiTopic}`,
          longer: `Expand this social media post with more detail while keeping it engaging:\n\n${aiTopic}`,
          emojis: `Add appropriate emojis to this social media post to make it more engaging (don't overdo it):\n\n${aiTopic}`,
          hashtags: `Add relevant hashtags to the end of this social media post:\n\n${aiTopic}`,
          rewrite: `Completely rewrite this social media post with fresh wording while keeping the same message:\n\n${aiTopic}`,
        };
        prompt = actionPrompts[aiAction] || aiTopic;
      }
      
      const response = await fetch("/api/admin/social/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          platforms: ["linkedin", "x", "facebook", "instagram"],
          tone: aiTone,
          includeEmojis: aiAction === "emojis" || (!isRevising),
          includeHashtags: aiAction === "hashtags" || (!isRevising),
        }),
      });

      const result = await response.json();
      if (result.content) {
        handleContentChange("master", result.content);
        setIsAIDialogOpen(false);
        setAiTopic("");
      }
    } catch (error) {
      console.error("AI generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Draft handler
  const handleSaveDraft = async () => {
    if (!posts.master.text.trim() && posts.master.media.length === 0) {
      setUploadError("Please add some content before saving");
      return;
    }

    setIsPublishing(true);
    setUploadError(null);
    
    try {
      // Get connected platforms
      const connectedPlatforms = Object.entries(accountStatus)
        .filter(([_, connected]) => connected)
        .map(([platform]) => platform);

      const response = await fetch("/api/admin/social/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textContent: posts.master.text,
          mediaUrls: posts.master.media,
          linkUrl: posts.master.linkUrl || null,
          targetPlatforms: connectedPlatforms,
          targetAccounts: connectedAccounts.map(a => a.id),
          scheduledAt: scheduledDate?.toISOString() || null,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to save draft");
      }

      // Show success and optionally redirect
      alert(scheduledDate ? "Post scheduled successfully!" : "Draft saved successfully!");
      
      // Clear the form
      setPosts(initialPostsState);
      setScheduledDate(undefined);
      
    } catch (error) {
      console.error("Save error:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setIsPublishing(false);
    }
  };

  // Publish handler (immediate publish)
  const handlePublish = async () => {
    if (isPublishing) return;
    
    if (!posts.master.text.trim() && posts.master.media.length === 0) {
      setUploadError("Please add some content before publishing");
      return;
    }

    // Check if any platforms are connected
    const connectedPlatforms = Object.entries(accountStatus)
      .filter(([_, connected]) => connected)
      .map(([platform]) => platform);
    
    if (connectedPlatforms.length === 0) {
      setUploadError("No social accounts connected. Please connect an account first.");
      return;
    }

    setIsPublishing(true);
    setUploadError(null);
    
    try {
      if (onPublish) {
        await onPublish(posts, scheduledDate);
      } else {
        // First save as draft
        const draftResponse = await fetch("/api/admin/social/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            textContent: posts.master.text,
            mediaUrls: posts.master.media,
            linkUrl: posts.master.linkUrl || null,
            targetPlatforms: connectedPlatforms,
            targetAccounts: connectedAccounts.map(a => a.id),
            scheduledAt: scheduledDate?.toISOString() || null,
          }),
        });

        const draftResult = await draftResponse.json();
        
        if (!draftResponse.ok) {
          throw new Error(draftResult.error || "Failed to create post");
        }

        // If scheduling for later, we're done
        if (scheduledDate && scheduledDate > new Date()) {
          alert("Post scheduled for " + scheduledDate.toLocaleString());
          setPosts(initialPostsState);
          setScheduledDate(undefined);
          return;
        }

        // Otherwise, trigger immediate publish
        const publishResponse = await fetch("/api/admin/social/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draftId: draftResult.draft.id,
          }),
        });

        const publishResult = await publishResponse.json();
        
        if (!publishResponse.ok) {
          throw new Error(publishResult.error || "Failed to publish");
        }

        alert("Post published successfully!");
        
        // Clear the form
        setPosts(initialPostsState);
        setScheduledDate(undefined);
      }
    } catch (error) {
      console.error("Publish error:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  // Get current platform content
  const currentContent = posts[activeTab];
  const currentCharLimit = PLATFORM_INFO[activeTab].charLimit;
  const charCount = currentContent.text.length;
  const isOverLimit = charCount > currentCharLimit;

  // Determine which preview to show
  const previewPlatform = activeTab === "master" ? "linkedin" : activeTab;

  // Render the disconnected empty state
  const renderDisconnectedState = () => {
    const platformInfo = PLATFORM_INFO[activeTab];
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center opacity-30"
            style={{ backgroundColor: `${platformInfo.color}20` }}
          >
            <span style={{ color: platformInfo.color }}>
              {platformInfo.icon}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {platformInfo.name} Not Connected
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Connect your {platformInfo.name} account to create and schedule posts for this platform.
          </p>
          <a 
            href="/admin/social/connections"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-4 py-2 text-white hover:opacity-90"
            style={{ 
              backgroundColor: platformInfo.color,
              borderColor: platformInfo.color,
            }}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Connect {platformInfo.name}</span>
          </a>
        </div>
      </div>
    );
  };

  // Render the disconnected preview placeholder
  const renderDisconnectedPreview = () => {
    const platformInfo = PLATFORM_INFO[activeTab];
    return (
      <div className="w-full max-w-[550px] rounded-2xl border border-border bg-muted/50 p-8 text-center">
        <div className="blur-sm opacity-50 pointer-events-none mb-4">
          {/* Blurred placeholder mimicking a post */}
          <div className="h-12 bg-muted rounded mb-3" />
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2 mb-4" />
          <div className="h-32 bg-muted rounded" />
        </div>
        <div className="relative -mt-20 bg-background/90 backdrop-blur rounded-lg p-4 border border-border">
          <p className="text-sm text-muted-foreground">
            Connect {platformInfo.name} to see preview
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] sm:h-[calc(100vh-160px)] lg:h-[calc(100vh-120px)] max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-180px)] gap-0 bg-background rounded-2xl overflow-hidden border border-border shadow-lg mb-20 lg:mb-0">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleImageSelect}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleVideoSelect}
      />

      {/* Left Column - Editor */}
      <div className="flex-1 flex flex-col border-r border-border min-w-0">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-border bg-card">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2 sm:mb-3">Create Post</h2>
          
          {/* Platform Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Platform)}>
            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <TabsList className="w-full min-w-max justify-start gap-1 bg-muted/50 p-1 inline-flex">
              {(Object.keys(PLATFORM_INFO) as Platform[]).map((platform) => {
                const info = PLATFORM_INFO[platform];
                const isOverridden = platform !== "master" && posts[platform].isOverridden;
                const isConnected = platform === "master" || accountStatus[platform as keyof AccountStatus];
                
                return (
                  <TabsTrigger
                    key={platform}
                    value={platform}
                    className={`relative data-[state=active]:bg-background data-[state=active]:shadow-sm px-2 sm:px-3 py-1.5 text-xs sm:text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                      !isConnected ? "opacity-50" : ""
                    }`}
                  >
                    <span 
                      className="flex items-center gap-1 sm:gap-1.5"
                      style={{ color: activeTab === platform ? info.color : undefined }}
                    >
                      {platform === "master" ? (
                        <>
                          <span className="hidden sm:inline">{info.name}</span>
                          <span className="sm:hidden">All</span>
                        </>
                      ) : (
                        <>
                          {info.icon}
                          <span className="hidden sm:inline">{info.name}</span>
                          <span className="sm:hidden">{info.name === "LinkedIn" ? "LI" : info.name === "Facebook" ? "FB" : info.name === "Instagram" ? "IG" : info.name}</span>
                        </>
                      )}
                      {!isConnected && (
                        <Plus className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                    </span>
                    {isOverridden && isConnected && (
                      <span 
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: info.color }}
                      />
                    )}
                  </TabsTrigger>
                );
              })}
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Disconnected Platform Warning for "All Platforms" tab */}
        {activeTab === "master" && disconnectedPlatforms.length > 0 && (
          <div className="px-3 sm:px-4 py-2.5 sm:py-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                <span className="font-medium">Note:</span>{" "}
                <span className="inline sm:hidden">
                  {disconnectedPlatforms.length} platform{disconnectedPlatforms.length > 1 ? "s" : ""} not connected.{" "}
                </span>
                <span className="hidden sm:inline">
                  {disconnectedPlatforms.map(p => PLATFORM_INFO[p].name).join(" and ")}{" "}
                  {disconnectedPlatforms.length === 1 ? "is" : "are"} not connected.{" "}
                </span>
                <a href="/admin/social/connections" className="underline hover:no-underline whitespace-nowrap inline-block mt-1 sm:mt-0 sm:inline">
                  Connect accounts
                </a>
              </p>
            </div>
          </div>
        )}

        {/* Override Notice */}
        {activeTab !== "master" && posts[activeTab].isOverridden && isCurrentPlatformConnected && (
          <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between">
            <span className="text-sm text-amber-700 dark:text-amber-300">
              Custom content for {PLATFORM_INFO[activeTab].name}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-amber-700 dark:text-amber-300 h-7"
              onClick={() => resetToMaster(activeTab as Exclude<Platform, "master">)}
            >
              <X className="w-3 h-3 mr-1" />
              Reset to Master
            </Button>
          </div>
        )}

        {/* Conditional Content: Connected vs Disconnected */}
        {!isCurrentPlatformConnected ? (
          renderDisconnectedState()
        ) : (
          <>
            {/* Text Area */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-white dark:bg-gray-950">
              <Textarea
                placeholder="What's on your mind? Share updates, stories, or announcements..."
                value={currentContent.text}
                onChange={(e) => handleContentChange(activeTab, e.target.value)}
                className="min-h-[150px] resize-none border-0 focus-visible:ring-0 text-sm sm:text-base leading-relaxed bg-transparent"
              />

              {/* Media Preview */}
              {posts.master.media.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">Attached Media</div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                    {posts.master.media.map((url, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border border-border">
                        {posts.master.mediaType === "video" ? (
                          <video src={url} className="w-full h-32 object-cover" />
                        ) : (
                          <img src={url} alt={`Media ${index + 1}`} className="w-full h-32 object-cover" />
                        )}
                        <button
                          onClick={() => handleRemoveMedia(index)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
                          aria-label="Remove media"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Link Preview */}
              {posts.master.linkUrl && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs sm:text-sm font-medium text-muted-foreground">Attached Link</div>
                  <div className="relative group rounded-lg border border-border overflow-hidden bg-muted/30">
                    {posts.master.linkPreview?.image && (
                      <img 
                        src={posts.master.linkPreview.image} 
                        alt="Link preview" 
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-2 sm:p-3">
                      <div className="font-medium text-xs sm:text-sm line-clamp-1 break-words">
                        {posts.master.linkPreview?.title || posts.master.linkUrl}
                      </div>
                      {posts.master.linkPreview?.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {posts.master.linkPreview.description}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{new URL(posts.master.linkUrl).hostname}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveLink}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity min-h-[36px] min-w-[36px] flex items-center justify-center touch-manipulation"
                      aria-label="Remove link"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Error */}
            {uploadError && (
              <div className="px-3 sm:px-4 py-2 bg-red-50 dark:bg-red-950/20 border-t border-red-200 dark:border-red-800">
                <span className="text-xs sm:text-sm text-red-600 dark:text-red-400 break-words">{uploadError}</span>
              </div>
            )}

            {/* Character Count */}
            <div className="px-3 sm:px-4 py-2 border-t border-border flex items-center justify-between text-xs sm:text-sm">
              <span className={isOverLimit ? "text-destructive font-medium" : "text-muted-foreground"}>
                {charCount.toLocaleString()} / {currentCharLimit.toLocaleString()} characters
              </span>
              {isOverLimit && (
                <Badge variant="destructive" className="text-xs">
                  {charCount - currentCharLimit} over limit
                </Badge>
              )}
            </div>

            {/* Media Toolbar */}
            <div className="p-3 sm:p-4 border-t border-border bg-card/50">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 mr-2" />
                  )}
                  Image
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
                
                {/* Link Dialog */}
                <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-foreground text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
                      disabled={!!posts.master.linkUrl}
                    >
                      <Link2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">Link</span>
                      <span className="sm:hidden">Link</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Link2 className="w-5 h-5" />
                        Add Link
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddLink()}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        The link preview will be fetched automatically.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddLink} disabled={!linkInput.trim()}>
                        Add Link
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Separator orientation="vertical" className="h-6 mx-1 sm:mx-2 hidden sm:block" />
                
            {/* AI Assist Button - Revise existing content or generate new */}
            <Dialog open={isAIDialogOpen} onOpenChange={(open) => {
              setIsAIDialogOpen(open);
              // Pre-fill with current content when opening
              if (open && currentContent.text.trim()) {
                setAiTopic(currentContent.text);
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:from-purple-500/20 hover:to-blue-500/20 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">AI Assist</span>
                  <span className="sm:hidden">AI</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    {currentContent.text.trim() ? "Revise with Claude" : "Draft with Claude"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {currentContent.text.trim() && (
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setAiAction("improve")}
                        className={aiAction === "improve" ? "border-purple-500 bg-purple-50" : ""}
                      >
                        ✨ Improve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setAiAction("shorter")}
                        className={aiAction === "shorter" ? "border-purple-500 bg-purple-50" : ""}
                      >
                        📝 Make Shorter
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setAiAction("longer")}
                        className={aiAction === "longer" ? "border-purple-500 bg-purple-50" : ""}
                      >
                        📄 Make Longer
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setAiAction("emojis")}
                        className={aiAction === "emojis" ? "border-purple-500 bg-purple-50" : ""}
                      >
                        😊 Add Emojis
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setAiAction("hashtags")}
                        className={aiAction === "hashtags" ? "border-purple-500 bg-purple-50" : ""}
                      >
                        # Add Hashtags
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setAiAction("rewrite")}
                        className={aiAction === "rewrite" ? "border-purple-500 bg-purple-50" : ""}
                      >
                        🔄 Rewrite
                      </Button>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {currentContent.text.trim() ? "Content to revise" : "Topic or idea"}
                    </label>
                    <Textarea
                      placeholder={currentContent.text.trim() ? "Your current content..." : "What do you want to post about?"}
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tone</label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    >
                      <option value="inspiring">Inspiring</option>
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="urgent">Urgent</option>
                      <option value="grateful">Grateful</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAIDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !aiTopic.trim()}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {currentContent.text.trim() ? "Revising..." : "Generating..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {currentContent.text.trim() ? "Revise" : "Generate"}
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-3 sm:p-4 border-t border-border bg-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex items-center gap-2">
                {/* Schedule Popover */}
                <Popover open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3">
                      {scheduledDate ? (
                        <>
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">
                            {scheduledDate.toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit"
                            })}
                          </span>
                          <span className="sm:hidden">
                            {scheduledDate.toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric"
                            })}
                          </span>
                        </>
                      ) : (
                        <>
                          <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Schedule</span>
                          <span className="sm:hidden">Schedule</span>
                        </>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={(date) => {
                        setScheduledDate(date);
                        if (date) setIsScheduleOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                    />
                    {scheduledDate && (
                      <div className="p-3 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => {
                            setScheduledDate(undefined);
                            setIsScheduleOpen(false);
                          }}
                        >
                          Clear Schedule
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={isPublishing || (!posts.master.text.trim() && posts.master.media.length === 0)}
              className="flex-1 sm:flex-initial min-h-[44px] text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Save Draft</span>
              <span className="sm:hidden">Draft</span>
            </Button>
            <Button 
              onClick={handlePublish}
              disabled={isPublishing || (!posts.master.text.trim() && posts.master.media.length === 0)}
              className="gap-2 flex-1 sm:flex-initial min-h-[44px] text-sm sm:text-base"
            >
                  {isPublishing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{scheduledDate ? "Schedule" : "Publish Now"}</span>
                  <span className="sm:hidden">{scheduledDate ? "Schedule" : "Publish"}</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Column - Preview */}
      <div className="flex-1 bg-muted/30 p-4 sm:p-6 overflow-y-auto hidden lg:block">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Live Preview
          </h3>
          <Badge variant="outline" className="text-xs">
            <Globe className="w-3 h-3 mr-1" />
            {PLATFORM_INFO[previewPlatform].name}
          </Badge>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          {/* Show disconnected preview if platform not connected */}
          {activeTab !== "master" && !accountStatus[activeTab as keyof AccountStatus] ? (
            renderDisconnectedPreview()
          ) : (
            <>
              {previewPlatform === "linkedin" && (
                <LinkedInPreview 
                  content={posts.linkedin.text} 
                  media={posts.linkedin.media}
                  linkUrl={posts.linkedin.linkUrl}
                  linkPreview={posts.linkedin.linkPreview}
                />
              )}
              {previewPlatform === "x" && (
                <XPreview 
                  content={posts.x.text} 
                  media={posts.x.media}
                  linkUrl={posts.x.linkUrl}
                  linkPreview={posts.x.linkPreview}
                />
              )}
              {previewPlatform === "facebook" && (
                <FacebookPreview 
                  content={posts.facebook.text} 
                  media={posts.facebook.media}
                  linkUrl={posts.facebook.linkUrl}
                  linkPreview={posts.facebook.linkPreview}
                />
              )}
              {previewPlatform === "instagram" && (
                <InstagramPreview 
                  content={posts.instagram.text} 
                  media={posts.instagram.media}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocialComposer;
