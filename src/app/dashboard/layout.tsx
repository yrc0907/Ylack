import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar";
import { WorkspaceHeader } from "@/components/WorkspaceHeader";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ChannelSidebar } from "@/components/ChannelSidebar";
import { WorkspaceProvider } from "@/context/WorkspaceContext";
import { MobileNav } from "@/components/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 如果未认证，重定向到登录页
  if (!session) {
    redirect("/login");
  }

  return (
    <WorkspaceProvider>
      <div className="h-screen flex">
        {/* 桌面端工作区侧边栏 - 在小屏幕上隐藏 */}
        <div className="hidden md:block">
          <WorkspaceSidebar />
        </div>

        {/* 移动端导航栏 - 仅在小屏幕上显示 */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <MobileNav />
        </div>

        <div className="flex flex-col flex-1 md:ml-20">
          <WorkspaceHeader />
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* 频道侧边栏 - 在小屏幕上隐藏或使用不同的布局 */}
            <ResizablePanel defaultSize={25} minSize={15} className="hidden sm:block">
              <ChannelSidebar />
            </ResizablePanel>
            <ResizableHandle withHandle className="hidden sm:flex" />
            <ResizablePanel defaultSize={75} className="sm:block flex-1">
              <main className="h-full overflow-hidden">{children}</main>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </WorkspaceProvider>
  );
} 