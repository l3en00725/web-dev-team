"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Repeat2, Heart, Bookmark, Share, MoreHorizontal } from "lucide-react";

interface XPreviewProps {
  content: string;
  media?: string[];
  linkUrl?: string;
  linkPreview?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

const CHAR_LIMIT = 280;

export function XPreview({ content, media = [], linkUrl, linkPreview }: XPreviewProps) {
  const charCount = content.length;
  const isOverLimit = charCount > CHAR_LIMIT;
  const remainingChars = CHAR_LIMIT - charCount;

  return (
    <div className="w-full max-w-[550px] bg-black text-white rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/logos/blue-kids-logo-dark.svg" alt="Blue Kids" />
          <AvatarFallback className="bg-blue-500 text-white font-bold text-sm">BK</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-1">
            <span className="font-bold text-[15px] text-white truncate">Blue Kids</span>
            <svg className="w-[18px] h-[18px] text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
            </svg>
          </div>
          <div className="text-gray-500 text-[15px]">@thebluekids</div>
        </div>

        <button className="text-gray-500 hover:text-gray-300 p-2 hover:bg-gray-800 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className={`text-[15px] leading-[1.4] whitespace-pre-wrap ${isOverLimit ? 'text-red-500' : 'text-white'}`}>
          {content || <span className="text-gray-500 italic">Your post content will appear here...</span>}
        </p>
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="mx-4 mb-3 rounded-2xl overflow-hidden border border-gray-800">
          <img 
            src={media[0]} 
            alt="Post media" 
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* Link Preview */}
      {linkUrl && !media.length && (
        <div className="mx-4 mb-3 rounded-2xl overflow-hidden border border-gray-800">
          {linkPreview?.image && (
            <img 
              src={linkPreview.image} 
              alt="Link preview" 
              className="w-full h-32 object-cover"
            />
          )}
          <div className="p-3">
            <div className="text-[13px] text-gray-500">
              {new URL(linkUrl).hostname}
            </div>
            <div className="font-medium text-[15px] text-white line-clamp-2 mt-0.5">
              {linkPreview?.title || linkUrl}
            </div>
            {linkPreview?.description && (
              <div className="text-[13px] text-gray-500 line-clamp-2 mt-0.5">
                {linkPreview.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="px-4 pb-3 text-gray-500 text-[15px]">
        <span>12:00 PM · Jan 18, 2026</span>
        <span className="mx-1">·</span>
        <span className="text-white font-bold">1.2K</span>
        <span> Views</span>
      </div>

      {/* Engagement Stats */}
      <div className="mx-4 py-3 border-t border-gray-800 flex items-center gap-4 text-[13px]">
        <span><span className="text-white font-bold">12</span> <span className="text-gray-500">Reposts</span></span>
        <span><span className="text-white font-bold">8</span> <span className="text-gray-500">Quotes</span></span>
        <span><span className="text-white font-bold">156</span> <span className="text-gray-500">Likes</span></span>
        <span><span className="text-white font-bold">4</span> <span className="text-gray-500">Bookmarks</span></span>
      </div>

      {/* Action Buttons */}
      <div className="mx-4 py-2 border-t border-gray-800 flex items-center justify-around">
        {[
          { icon: MessageCircle, count: "24" },
          { icon: Repeat2, count: "12" },
          { icon: Heart, count: "156" },
          { icon: Bookmark, count: "" },
          { icon: Share, count: "" },
        ].map(({ icon: Icon, count }, idx) => (
          <button
            key={idx}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-400 p-2 hover:bg-blue-400/10 rounded-full transition-colors"
          >
            <Icon className="w-5 h-5" />
            {count && <span className="text-[13px]">{count}</span>}
          </button>
        ))}
      </div>

      {/* Character Counter */}
      <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-end">
        <div className={`text-sm font-medium ${
          isOverLimit ? 'text-red-500' : 
          remainingChars <= 20 ? 'text-yellow-500' : 'text-gray-500'
        }`}>
          {remainingChars}
        </div>
      </div>
    </div>
  );
}
