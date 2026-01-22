"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";

interface InstagramPreviewProps {
  content: string;
  media?: string[];
}

export function InstagramPreview({ content, media = [] }: InstagramPreviewProps) {
  const hasMedia = media.length > 0;
  
  // For Instagram, truncate caption at certain length with "...more"
  const maxCaptionLength = 125;
  const shouldTruncate = content.length > maxCaptionLength;
  const displayContent = shouldTruncate 
    ? content.slice(0, maxCaptionLength) + "..." 
    : content;

  return (
    <div className="w-full max-w-[470px] bg-white border border-gray-200 rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 flex items-center gap-3 border-b border-gray-100">
        <Avatar className="h-8 w-8 ring-2 ring-pink-500 ring-offset-2">
          <AvatarImage src="/logos/blue-kids-logo-dark.svg" alt="Blue Kids" />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold text-xs">BK</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="font-semibold text-[14px] text-gray-900">thebluekids</div>
        </div>

        <button className="text-gray-900 p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Media Area - Instagram requires media */}
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        {hasMedia ? (
          <img 
            src={media[0]} 
            alt="Post media" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-400 text-sm">Add an image or video</p>
            <p className="text-gray-300 text-xs mt-1">Instagram posts require media</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="hover:opacity-60 transition-opacity">
            <Heart className="w-6 h-6" />
          </button>
          <button className="hover:opacity-60 transition-opacity">
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="hover:opacity-60 transition-opacity">
            <Send className="w-6 h-6" />
          </button>
        </div>
        <button className="hover:opacity-60 transition-opacity">
          <Bookmark className="w-6 h-6" />
        </button>
      </div>

      {/* Likes */}
      <div className="px-3 pb-1">
        <span className="font-semibold text-[14px] text-gray-900">1,234 likes</span>
      </div>

      {/* Caption */}
      <div className="px-3 pb-2">
        <p className="text-[14px] text-gray-900 leading-[1.4]">
          <span className="font-semibold">thebluekids </span>
          {content ? (
            <>
              {displayContent}
              {shouldTruncate && (
                <span className="text-gray-400 cursor-pointer"> more</span>
              )}
            </>
          ) : (
            <span className="text-gray-400 italic">Your caption will appear here...</span>
          )}
        </p>
      </div>

      {/* View Comments */}
      <div className="px-3 pb-1">
        <span className="text-gray-400 text-[14px] cursor-pointer">View all 48 comments</span>
      </div>

      {/* Timestamp */}
      <div className="px-3 pb-3">
        <span className="text-gray-400 text-[10px] uppercase tracking-wide">Just now</span>
      </div>

      {/* Add Comment */}
      <div className="px-3 py-3 border-t border-gray-100 flex items-center gap-3">
        <span className="text-xl">😊</span>
        <input 
          type="text" 
          placeholder="Add a comment..." 
          className="flex-1 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
          disabled
        />
        <span className="text-blue-500 font-semibold text-[14px] opacity-50">Post</span>
      </div>
    </div>
  );
}
