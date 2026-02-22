import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

export default function FrontDeskDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get report requests targeted at front_desk
  const reportRequests = useQuery(
    api.reportRequests.listByRole,
    { targetRole: "front_desk" }
  );
  
  // Filter by search
  const filteredReports = useMemo(() => {
    if (!reportRequests) return [];
    const q = searchQuery.toLowerCase();
    return reportRequests.filter(
      (r) =>
        r.subject.toLowerCase().includes(q) ||
        r.message.toLowerCase().includes(q) ||
        (r.fromUserName && r.fromUserName.toLowerCase().includes(q))
    );
  }, [reportRequests, searchQuery]);
  
  const pendingCount = reportRequests?.filter(r => r.status === "Sent").length || 0;
  
  {/* Report Requests Panel */}
  <Card className="gradient-card">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Report Requests
          {pendingCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingCount} pending
            </Badge>
          )}
        </CardTitle>
        <Input
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
      </div>
    </CardHeader>
    <CardContent>
      {filteredReports && filteredReports.length > 0 ? (
        <div className="space-y-3">
          {filteredReports.map((req) => (
            <div
              key={req._id}
              className="rounded-lg border border-border bg-background/50 p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-foreground">{req.subject}</div>
                  <div className="text-xs text-muted-foreground">
                    From: {req.fromUserName || "Unknown"} • {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    req.status === "Sent"
                      ? "text-yellow-400 border-yellow-400/30"
                      : req.status === "Acknowledged"
                      ? "text-blue-400 border-blue-400/30"
                      : "text-green-400 border-green-400/30"
                  }
                >
                  {req.status}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground bg-background/30 p-2 rounded">
                {req.message}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No report requests found
        </div>
      )}
    </CardContent>
  </Card>
}