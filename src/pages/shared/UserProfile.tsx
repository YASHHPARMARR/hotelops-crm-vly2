import { AdminShell } from "@/components/layouts/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getSupabase, getSupabaseUserEmail } from "@/lib/supabaseClient";
import { User, Mail, Phone, MapPin, Key, Save } from "lucide-react";

type UserProfile = {
  id?: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  quickAccessCode?: string;
  role?: string;
  membership?: string;
  loyalty_points?: number;
};

export default function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user?.email]);

  async function fetchProfile() {
    try {
      const supabase = getSupabase();
      const email = await getSupabaseUserEmail();
      
      if (!supabase || !email) {
        setLoading(false);
        return;
      }

      // Try to fetch from guests table first
      const { data: guestData } = await supabase
        .from("guests")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (guestData) {
        setProfile({
          id: guestData.id,
          email: guestData.email || email,
          full_name: guestData.full_name,
          phone: guestData.phone,
          address: guestData.address,
          quickAccessCode: guestData.quickAccessCode,
          membership: guestData.membership,
          loyalty_points: guestData.loyalty_points,
        });
      } else {
        // Try accounts table
        const { data: accountData } = await supabase
          .from("accounts")
          .select("*")
          .eq("email", email)
          .maybeSingle();

        if (accountData) {
          setProfile({
            id: accountData.id,
            email: accountData.email || email,
            role: accountData.role,
          });
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const supabase = getSupabase();
      const email = await getSupabaseUserEmail();
      
      if (!supabase || !email) {
        toast.error("Database not configured");
        setSaving(false);
        return;
      }

      // Generate quick access code if not exists
      let quickAccessCode = profile.quickAccessCode;
      if (!quickAccessCode) {
        quickAccessCode = `QA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      }

      // Update guests table
      const { error } = await supabase
        .from("guests")
        .upsert({
          email: email,
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          quickAccessCode: quickAccessCode,
          membership: profile.membership || "None",
          loyalty_points: profile.loyalty_points || 0,
        }, {
          onConflict: "email",
        });

      if (error) throw error;

      setProfile({ ...profile, quickAccessCode });
      toast.success("Profile updated successfully");
      fetchProfile();
    } catch (err) {
      console.error("Error saving profile:", err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading profile...</div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="gradient-card md:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.image} />
                  <AvatarFallback className="text-2xl">
                    {profile.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{profile.full_name || "User"}</h3>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                  {profile.role && (
                    <Badge className="mt-2 capitalize">{profile.role.replace("_", " ")}</Badge>
                  )}
                  {profile.membership && profile.membership !== "None" && (
                    <Badge className="mt-2" variant="secondary">{profile.membership} Member</Badge>
                  )}
                </div>
                {profile.quickAccessCode && (
                  <div className="w-full p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Key className="h-4 w-4" />
                      <span className="font-mono font-bold">{profile.quickAccessCode}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Quick Access Code</p>
                  </div>
                )}
                {profile.loyalty_points !== undefined && (
                  <div className="w-full p-3 bg-accent rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{profile.loyalty_points}</div>
                    <p className="text-xs text-muted-foreground">Loyalty Points</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card className="gradient-card md:col-span-2">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="full_name">
                    <User className="inline h-4 w-4 mr-2" />
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">
                    <Phone className="inline h-4 w-4 mr-2" />
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={profile.address || ""}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    placeholder="Enter your address"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="neon-glow"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
