"use client";

import { Search, HelpCircle, AlertCircle, Menu } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChannelSidebar } from "@/components/ChannelSidebar";

export function WorkspaceHeader() {
  const { currentWorkspace, isLoading } = useWorkspace();

  // 构建搜索框占位符文本
  const getSearchPlaceholder = () => {
    if (isLoading) return "搜索...";
    if (!currentWorkspace) return "搜索 (无工作区)";
    return `搜索 ${currentWorkspace.name} 工作区`;
  };

  return (
    <div className="h-14 bg-purple-900 flex items-center px-4">
      {/* 移动端菜单按钮，仅在小屏幕上显示 */}
      <div className="sm:hidden mr-2">
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="text-white p-1.5 hover:bg-purple-800 rounded"
              aria-label="打开频道菜单"
              title="打开频道菜单"
            >
              <Menu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[80%] sm:w-[380px] p-0">
            <div className="h-full overflow-y-auto">
              <ChannelSidebar />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {!isLoading && !currentWorkspace && (
        <div className="hidden sm:flex items-center mr-4">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
          <span className="text-yellow-100 text-sm">未选择工作区</span>
        </div>
      )}

      <div className="relative max-w-[600px] w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder={getSearchPlaceholder()}
          className="w-full bg-purple-800 text-white rounded-md pl-10 pr-4 py-1.5 border border-purple-700 focus:outline-none focus:ring-1 focus:ring-white text-sm"
        />
      </div>
      <div className="ml-auto">
        <button
          className="text-white p-2 rounded-full hover:bg-purple-800"
          aria-label="Help"
          title="Help"
        >
          <HelpCircle size={20} />
        </button>
      </div>
    </div>
  );
}