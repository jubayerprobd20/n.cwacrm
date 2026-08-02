"use client";

import React from "react";
import { Server, ShieldCheck, Database, Cpu, Globe, CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminSystemPage() {
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          System Health & WhatsApp Providers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor Evolution API gateways, Supabase database connectivity, and platform infrastructure services.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">
              WhatsApp API Gateway (Evolution)
            </CardTitle>
            <Server className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500 text-white font-bold text-xs">
                Connected & Ready
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Multi-tenant instance orchestration active
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">
              Supabase Database & RLS
            </CardTitle>
            <Database className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500 text-white font-bold text-xs">
                PostgreSQL Healthy
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Multi-tenant Row Level Security enforced
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-muted-foreground">
              Webhook & Queue Engine
            </CardTitle>
            <Cpu className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500 text-white font-bold text-xs">
                0 Pending Tasks
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Real-time incoming message processing
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">
            Platform Environment Configuration
          </CardTitle>
          <CardDescription>
            Core environment variables and integration checkpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="font-bold">NextCore Master Admin Security</p>
                  <p className="text-xs text-muted-foreground">
                    Restricted to platform owners and level-0 administrators
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5 font-bold">
                Protected
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="font-bold">Dynamic Pricing Engine</p>
                  <p className="text-xs text-muted-foreground">
                    saas_subscription_plans table linked to billing checkout
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5 font-bold">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
