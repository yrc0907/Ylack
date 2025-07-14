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
    <div className="h-screen flex">
      <WorkspaceSidebar />
      <div className="flex flex-col flex-1 ml-20">
        <WorkspaceHeader />
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={25} minSize={15}>
            <ChannelSidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <main className="h-full overflow-hidden">{children}</main>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
} 