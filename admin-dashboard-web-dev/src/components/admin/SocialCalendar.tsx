"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Facebook,
  Instagram,
  Clock,
  Trash2,
  Save,
  ImageIcon,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Circle,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";

// Types
interface ScheduledPost {
  id: string;
  date: string;
  platform: string;
  platforms: string[];
  content: string;
  media: string[];
  linkUrl?: string;
  status: "draft" | "scheduled" | "publishing" | "published" | "failed";
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// Platform config
const PLATFORM_CONFIG: Record<string, { name: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  linkedin: {
    name: "LinkedIn",
    color: "#0A66C2",
    bgColor: "bg-[#0A66C2]/10",
    icon: <Linkedin className="w-3 h-3" />,
  },
  x: {
    name: "X",
    color: "#000000",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  twitter: {
    name: "X",
    color: "#000000",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    icon: (
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  facebook: {
    name: "Facebook",
    color: "#1877F2",
    bgColor: "bg-[#1877F2]/10",
    icon: <Facebook className="w-3 h-3" />,
  },
  instagram: {
    name: "Instagram",
    color: "#E4405F",
    bgColor: "bg-[#E4405F]/10",
    icon: <Instagram className="w-3 h-3" />,
  },
  unknown: {
    name: "Unknown",
    color: "#6B7280",
    bgColor: "bg-gray-100",
    icon: <Circle className="w-3 h-3" />,
  },
};

// Status config with colors and icons
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  draft: { 
    label: "Draft", 
    color: "#6B7280", 
    bgColor: "bg-gray-100 dark:bg-gray-800",
    icon: <Circle className="w-2.5 h-2.5" />
  },
  scheduled: { 
    label: "Scheduled", 
    color: "#3B82F6", 
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    icon: <Clock className="w-2.5 h-2.5" />
  },
  publishing: { 
    label: "Publishing", 
    color: "#F59E0B", 
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    icon: <Loader2 className="w-2.5 h-2.5 animate-spin" />
  },
  published: { 
    label: "Published", 
    color: "#10B981", 
    bgColor: "bg-green-100 dark:bg-green-900/30",
    icon: <CheckCircle className="w-2.5 h-2.5" />
  },
  failed: { 
    label: "Failed", 
    color: "#EF4444", 
    bgColor: "bg-red-100 dark:bg-red-900/30",
    icon: <AlertCircle className="w-2.5 h-2.5" />
  },
};

// Day names
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Auto-refresh interval (30 seconds)
const REFRESH_INTERVAL = 30000;

export function SocialCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [editedTime, setEditedTime] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch posts from API
  const fetchPosts = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    
    setError(null);

    try {
      // Get date range for current month view (including overflow days)
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);

      const params = new URLSearchParams({
        startDate: calendarStart.toISOString(),
        endDate: calendarEnd.toISOString(),
      });

      const response = await fetch(`/api/admin/social/calendar?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch posts");
      }

      setPosts(result.posts || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching calendar posts:", err);
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentDate]);

  // Initial fetch and refetch when month changes
  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchPosts]);

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Get posts for a specific day
  const getPostsForDay = (day: Date) => {
    return posts.filter((post) => {
      const postDate = new Date(post.date);
      return isSameDay(postDate, day);
    });
  };

  // Navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Open post for editing
  const handlePostClick = (post: ScheduledPost) => {
    setSelectedPost(post);
    setEditedContent(post.content);
    const postDate = new Date(post.date);
    setEditedTime(format(postDate, "HH:mm"));
    setIsSheetOpen(true);
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!selectedPost) return;

    try {
      const [hours, minutes] = editedTime.split(":").map(Number);
      const newDate = new Date(selectedPost.date);
      newDate.setHours(hours, minutes);

      const response = await fetch("/api/admin/social/drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedPost.id,
          textContent: editedContent,
          scheduledAt: newDate.toISOString(),
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save changes");
      }

      // Refresh posts
      await fetchPosts(false);
      
      setIsSheetOpen(false);
      setSelectedPost(null);
    } catch (err) {
      console.error("Error saving changes:", err);
      alert(err instanceof Error ? err.message : "Failed to save changes");
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!selectedPost) return;

    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch("/api/admin/social/drafts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedPost.id }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete post");
      }

      // Refresh posts
      await fetchPosts(false);
      
      setIsSheetOpen(false);
      setSelectedPost(null);
    } catch (err) {
      console.error("Error deleting post:", err);
      alert(err instanceof Error ? err.message : "Failed to delete post");
    }
  };

  // Get platform config with fallback
  const getPlatformConfig = (platform: string) => {
    return PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.unknown;
  };

  return (
    <div className="bg-white dark:bg-gray-950 rounded-2xl border border-border shadow-lg overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {/* Last updated indicator */}
          {lastUpdated && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Updated {format(lastUpdated, "h:mm a")}
            </span>
          )}
          {/* Manual refresh button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => fetchPosts(false)}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
          <Button variant="link" size="sm" onClick={() => fetchPosts(true)} className="ml-2 text-red-700">
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading calendar...</p>
        </div>
      ) : (
        <>
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/30">
            {DAYS.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-semibold text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayPosts = getPostsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <div
                  key={index}
                  className={`min-h-[120px] border-b border-r border-border p-2 ${
                    !isCurrentMonth ? "bg-muted/20" : "bg-white dark:bg-gray-950"
                  } ${index % 7 === 0 ? "border-l-0" : ""}`}
                >
                  {/* Date Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 text-sm rounded-full ${
                        isTodayDate
                          ? "bg-primary text-primary-foreground font-bold"
                          : isCurrentMonth
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {dayPosts.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{dayPosts.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Post Pills */}
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post) => {
                      const platformConfig = getPlatformConfig(post.platform);
                      const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
                      
                      return (
                        <button
                          key={post.id}
                          onClick={() => handlePostClick(post)}
                          className={`w-full text-left px-2 py-1 rounded text-xs truncate flex items-center gap-1.5 transition-all hover:ring-2 hover:ring-offset-1 ${statusConfig.bgColor}`}
                          style={{
                            borderLeft: `3px solid ${platformConfig.color}`,
                          }}
                        >
                          {/* Status indicator */}
                          <span style={{ color: statusConfig.color }}>
                            {statusConfig.icon}
                          </span>
                          {/* Platform icon */}
                          <span style={{ color: platformConfig.color }}>
                            {platformConfig.icon}
                          </span>
                          <span className="truncate text-foreground/80">
                            {post.content.slice(0, 20)}...
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-border bg-card/50">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-muted-foreground font-medium">Status:</span>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span style={{ color: config.color }}>{config.icon}</span>
                  <span className="text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm mt-2">
              <span className="text-muted-foreground font-medium">Platforms:</span>
              {Object.entries(PLATFORM_CONFIG).filter(([k]) => k !== 'unknown' && k !== 'twitter').map(([key, config]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-muted-foreground">{config.name}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedPost && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span
                    className="p-1.5 rounded"
                    style={{
                      backgroundColor: `${getPlatformConfig(selectedPost.platform).color}20`,
                      color: getPlatformConfig(selectedPost.platform).color,
                    }}
                  >
                    {getPlatformConfig(selectedPost.platform).icon}
                  </span>
                  Edit {getPlatformConfig(selectedPost.platform).name} Post
                </SheetTitle>
                <SheetDescription>
                  Scheduled for {format(new Date(selectedPost.date), "EEEE, MMMM d, yyyy")}
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge 
                    className={STATUS_CONFIG[selectedPost.status]?.bgColor}
                    style={{ color: STATUS_CONFIG[selectedPost.status]?.color }}
                  >
                    <span className="mr-1">{STATUS_CONFIG[selectedPost.status]?.icon}</span>
                    {STATUS_CONFIG[selectedPost.status]?.label}
                  </Badge>
                </div>

                {/* Scheduled Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={editedTime}
                    onChange={(e) => setEditedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                    disabled={selectedPost.status === 'published' || selectedPost.status === 'publishing'}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Post Content</label>
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[200px]"
                    disabled={selectedPost.status === 'published' || selectedPost.status === 'publishing'}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {editedContent.length} characters
                  </div>
                </div>

                {/* Media Preview */}
                {selectedPost.media && selectedPost.media.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      Attached Media
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPost.media.map((url, i) => (
                        <div
                          key={i}
                          className="aspect-video bg-muted rounded-lg overflow-hidden border border-border"
                        >
                          <img src={url} alt={`Media ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preview</label>
                  <div
                    className="p-4 rounded-lg border border-border"
                    style={{
                      borderLeftWidth: "4px",
                      borderLeftColor: getPlatformConfig(selectedPost.platform).color,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                        BK
                      </div>
                      <div>
                        <div className="font-semibold text-sm">Blue Kids</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(selectedPost.date), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{editedContent}</p>
                  </div>
                </div>
              </div>

              <SheetFooter className="flex gap-2">
                {selectedPost.status !== 'published' && selectedPost.status !== 'publishing' && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={handleDeletePost}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                    <Button onClick={handleSaveChanges} className="gap-2 flex-1">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </>
                )}
                {(selectedPost.status === 'published' || selectedPost.status === 'publishing') && (
                  <p className="text-sm text-muted-foreground">
                    This post has been {selectedPost.status} and cannot be edited.
                  </p>
                )}
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default SocialCalendar;
