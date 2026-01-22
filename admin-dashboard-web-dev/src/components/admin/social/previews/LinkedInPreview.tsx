"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageSquare, Repeat2, Send, Globe } from "lucide-react";

interface LinkedInPreviewProps {
  content: string;
  media?: string[];
  linkUrl?: string;
  linkPreview?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export function LinkedInPreview({ content, media = [], linkUrl, linkPreview }: LinkedInPreviewProps) {
  return (
    <div className="w-full max-w-[550px] bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src="/logos/blue-kids-logo-dark.svg" alt="Blue Kids" />
          <AvatarFallback className="bg-blue-600 text-white font-bold">BK</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-[14px] leading-tight">Blue Kids</div>
          <div className="text-gray-500 text-[12px] leading-tight">Youth Sports Nonprofit • Cape May County, NJ</div>
          <div className="flex items-center gap-1 text-gray-500 text-[12px] mt-0.5">
            <span>Now</span>
            <span>•</span>
            <Globe className="w-3 h-3" />
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="5" cy="12" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 text-[14px] leading-[1.4] whitespace-pre-wrap">
          {content || <span className="text-gray-400 italic">Your post content will appear here...</span>}
        </p>
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="w-full aspect-video bg-gray-100 border-t border-b border-gray-200">
          <img 
            src={media[0]} 
            alt="Post media" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Link Preview */}
      {linkUrl && !media.length && (
        <div className="mx-4 mb-3 border border-gray-200 rounded-lg overflow-hidden">
          {linkPreview?.image && (
            <img 
              src={linkPreview.image} 
              alt="Link preview" 
              className="w-full h-32 object-cover"
            />
          )}
          <div className="p-3 bg-gray-50">
            <div className="text-[12px] text-gray-500 uppercase tracking-wide">
              {new URL(linkUrl).hostname}
            </div>
            <div className="font-semibold text-[14px] text-gray-900 line-clamp-2 mt-1">
              {linkPreview?.title || linkUrl}
            </div>
            {linkPreview?.description && (
              <div className="text-[12px] text-gray-500 line-clamp-2 mt-1">
                {linkPreview.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-gray-500 text-[12px] border-b border-gray-100">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <ThumbsUp className="w-2.5 h-2.5 text-white" />
            </span>
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px]">❤️</span>
          </div>
          <span className="ml-1">24</span>
        </div>
        <div className="flex items-center gap-3">
          <span>3 comments</span>
          <span>2 reposts</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-1 flex items-center justify-between">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageSquare, label: "Comment" },
          { icon: Repeat2, label: "Repost" },
          { icon: Send, label: "Send" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-[13px] font-medium"
          >
            <Icon className="w-5 h-5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
