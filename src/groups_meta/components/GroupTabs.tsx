// components/GroupTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function GroupTabs() {
  return (
    <div className="p-4">
      <Tabs defaultValue="notes" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-2">Group Notes</h2>
              <p className="text-muted-foreground">View and contribute to shared notes here.</p>
              {/* Add note editor or list here */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-2">Group Chat</h2>
              <p className="text-muted-foreground">Coming soon: Real-time chat for group members.</p>
              {/* Add chat UI / placeholder */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-2">Group Settings</h2>
              <p className="text-muted-foreground">Update group name, add/remove members, and more.</p>
              {/* Add role-based settings (admin-only actions) */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
