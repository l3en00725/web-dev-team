"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThumbsUp, MessageCircle, Share2, Globe, MoreHorizontal } from "lucide-react";

interface FacebookPreviewProps {
  content: string;
  media?: string[];
  linkUrl?: string;
  linkPreview?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export function FacebookPreview({ content, media = [], linkUrl, linkPreview }: FacebookPreviewProps) {
  return (
    <div className="w-full max-w-[550px] bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-start gap-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/logos/blue-kids-logo-dark.svg" alt="Blue Kids" />
          <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">BK</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="font-semibold text-[15px] text-gray-900 hover:underline cursor-pointer">
            Blue Kids
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-[13px]">
            <span>Just now</span>
            <span>·</span>
            <Globe className="w-3 h-3" />
          </div>
        </div>

        <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 text-[15px] leading-[1.33] whitespace-pre-wrap">
          {content || <span className="text-gray-400 italic">Your post content will appear here...</span>}
        </p>
      </div>

      {/* Media Preview */}
      {media.length > 0 && (
        <div className="w-full aspect-[1.91/1] bg-gray-100">
          <img 
            src={media[0]} 
            alt="Post media" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Link Preview */}
      {linkUrl && !media.length && (
        <div className="border-t border-b border-gray-200">
          {linkPreview?.image && (
            <img 
              src={linkPreview.image} 
              alt="Link preview" 
              className="w-full aspect-[1.91/1] object-cover"
            />
          )}
          <div className="p-3 bg-gray-50">
            <div className="text-[12px] text-gray-500 uppercase">
              {new URL(linkUrl).hostname}
            </div>
            <div className="font-semibold text-[16px] text-gray-900 line-clamp-2 mt-1">
              {linkPreview?.title || linkUrl}
            </div>
            {linkPreview?.description && (
              <div className="text-[14px] text-gray-500 line-clamp-1 mt-1">
                {linkPreview.description}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engagement Stats */}
      <div className="px-4 py-2 flex items-center justify-between text-gray-500 text-[15px]">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <span className="w-[18px] h-[18px] rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
              <ThumbsUp className="w-2.5 h-2.5 text-white" />
            </span>
            <span className="w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center border-2 border-white text-[9px]">
              ❤️
            </span>
          </div>
          <span className="ml-1 hover:underline cursor-pointer">42</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hover:underline cursor-pointer">8 comments</span>
          <span className="hover:underline cursor-pointer">3 shares</span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-200" />

      {/* Action Buttons */}
      <div className="px-2 py-1 flex items-center">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Comment" },
          { icon: Share2, label: "Share" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-[15px] font-semibold"
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
