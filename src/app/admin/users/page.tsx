"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, ShieldCheck, ShieldAlert, RefreshCw, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  role?: string;
  is_super_admin?: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/super-admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("[AdminUsers] Error:", err);
      toast.error("Failed to load platform users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleSuperAdmin = async (user: UserProfile) => {
    if (!user.email) {
      toast.error("User does not have a valid email address");
      return;
    }
    const nextStatus = !user.is_super_admin;
    setUpdatingId(user.id);

    try {
      const res = await fetch("/api/super-admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          is_super_admin: nextStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to modify role");
      }

      toast.success(
        `Successfully ${nextStatus ? "granted" : "revoked"} Super Admin access for ${user.email}`
      );
      fetchUsers();
    } catch (err: unknown) {
      toast.error("Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    return (
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.full_name && u.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading SaaS Platform Users...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Platform Users & Administrator Roles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all registered user profiles across the SaaS and assign or revoke Super Admin privileges.
          </p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="shrink-0">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Users
        </Button>
      </div>

      <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or full name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium">
          Total Registered Users: <strong>{users.length}</strong>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-5 py-3.5 font-bold">User Profile</th>
                <th className="px-5 py-3.5 font-bold">Email Address</th>
                <th className="px-5 py-3.5 font-bold">Org Role</th>
                <th className="px-5 py-3.5 font-bold">Platform Status</th>
                <th className="px-5 py-3.5 font-bold">Joined Date</th>
                <th className="px-5 py-3.5 text-right font-bold">Governance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user) => {
                const isSuper = Boolean(user.is_super_admin);
                return (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{user.full_name || "No Name"}</p>
                          <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-medium">
                      {user.email || "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="outline" className="capitalize text-xs font-semibold">
                        {user.role || "owner"}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      {isSuper ? (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs">
                          <Crown className="h-3 w-3 mr-1 inline" />
                          Super Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="font-medium text-xs">
                          Regular Member
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant={isSuper ? "destructive" : "outline"}
                        disabled={updatingId === user.id}
                        onClick={() => handleToggleSuperAdmin(user)}
                        className="text-xs font-semibold"
                      >
                        {isSuper ? (
                          <>
                            <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
                            Revoke Admin
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                            Promote to Admin
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                    No user profiles found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
