import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import GroupContent from "../layout/PageLayout";
import { MobileHeader } from "../layout/MobileHeader";
import { getGroupById } from "@/services/supabase-groups"; // Adjust import path as needed
import { Loader2, AlertCircle, Users } from "lucide-react";
import type { StudyGroup } from "@/types/groups";

const GroupPage = () => {
  const params = useParams();
  const groupId = params.groupId as string | undefined;
  
  const [group, setGroup] = useState<StudyGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      if (!groupId) {
        setError("Group ID not found");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const groupData = await getGroupById(groupId);
        
        if (!groupData) {
          setError("Group not found");
        } else {
          setGroup(groupData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load group");
        console.error("Error fetching group:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroup();
  }, [groupId]);

  const LoadingState = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading group...</h2>
        <p className="text-sm text-gray-600">Please wait while we fetch the group details</p>
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
        <p className="text-sm text-gray-600 mb-6">{error}</p>
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
        <MobileHeader group={group || null} />
        <LoadingState />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div>
        <MobileHeader group={group || null} />
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