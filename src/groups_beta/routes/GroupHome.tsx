import { MessageCircle } from "lucide-react"

const GroupHome = () => {
  return (
    
     
    <div className="flex-1 flex items-center mx-auto justify-center">
      <div className="text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome to StudyBuddy</h2>
        <p className="text-gray-500">Select a group to start collaborating</p>
      </div>
    </div>
  
    
  )
}

export default GroupHome