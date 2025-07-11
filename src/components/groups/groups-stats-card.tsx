
import { Users, BookOpen } from "lucide-react"

const GroupStatsCard = () => {
  return (
   <>
   {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">My Groups</h3>
          </div>
          <p className="text-2xl font-bold mt-2">-</p>
          <p className="text-sm text-muted-foreground">{
            
            }</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold">Active Chats</h3>
          </div>
          <p className="text-2xl font-bold mt-2">-</p>
          <p className="text-sm text-muted-foreground">Recent conversations</p>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            <h3 className="font-semibold">Total Members</h3>
          </div>
          <p className="text-2xl font-bold mt-2">-</p>
          <p className="text-sm text-muted-foreground">Across all groups</p>
        </div>
      </div>
   
   </>
    
  )
}

export default GroupStatsCard


  