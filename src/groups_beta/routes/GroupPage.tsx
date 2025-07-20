import { useParams } from "react-router-dom";
import GroupContent from "../layout/PageLayout";
import { MobileHeader } from "../layout/MobileHeader";
import { getGroupById } from "@/services/supabase-groups";
import { AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { StudyGroup } from "@/types/groups";

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
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });

  const SkeletonGroup = () => (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="space-y-6 max-w-4xl mx-auto animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-2/3 bg-gray-200 rounded" />
        <div className="h-4 w-1/2 bg-gray-200 rounded" />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div>
        <MobileHeader group={null} />
        <SkeletonGroup />
      </div>
    );
  }

  if (isError || !group) {
    return (
      <div>
        <MobileHeader group={null} />
        <ErrorState />
      </div>
    );
  }

  return (
    <div>
      <MobileHeader group={group} />
      <GroupContent group={group} />
    </div>
  );
};

export default GroupPage;
