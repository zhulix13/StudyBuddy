import { useParams } from "react-router-dom";
import GroupContent from "../layout/PageLayout";
import { MobileHeader } from "../layout/MobileHeader";
import { getGroupById } from "@/services/supabase-groups";
import { AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { StudyGroup } from "@/types/groups";
import NotesSkeleton from "@/loaders/NotesSkeleton";

const GroupPage = () => {
  const params = useParams();
  const groupId = params.groupId as string | undefined;

  const {
    data: group,
    isLoading,
    isError,
    error,
  } = useQuery<StudyGroup | null, Error>({
    queryKey: ["group", groupId],
    queryFn: () => {
      if (!groupId) throw new Error("Group ID not provided");
      return getGroupById(groupId);
    },
    enabled: !!groupId,
    staleTime: 1000 * 60 * 5,
  });

  const ErrorState = () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Group not found</h2>
        <p className="text-sm text-gray-600 mb-6">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <MobileHeader group={null} />
        <div className="flex-1">
          <NotesSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div className="h-full flex flex-col">
        <MobileHeader group={null} />
        <div className="flex-1">
          <ErrorState />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <MobileHeader group={group} />
      <div className="flex-1 overflow-hidden">
        <GroupContent group={group} />
      </div>
    </div>
  );
};

export default GroupPage;
