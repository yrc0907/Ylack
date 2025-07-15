
import Tiptap from "@/components/editor";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Workspace",
  description: "Workspace page",
};

export default function WorkspacePage() {
  return (
    <div className="flex flex-col h-full p-6">
      <h1 className="text-2xl font-bold">Workspace id page</h1>
      <div className="flex-grow">{/* Main content area */}</div>
      <Tiptap />
    </div>
  );
} 