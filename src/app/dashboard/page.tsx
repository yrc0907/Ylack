import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Workspace page",
};

export default function WorkspacePage() {
  return (
    <div className="h-full overflow-hidden p-6">
      <h1 className="text-2xl font-bold">Workspace id page</h1>
    </div>
  );
} 