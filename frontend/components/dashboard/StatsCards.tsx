"use client";

import { ShoppingCart, Shield, Clock, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const statsData = [
  {
    id: 1,
    title: "Lorem ipsum",
    value: "12,350",
    subtitle: "7,332 Lorem ipsum",
    icon: ShoppingCart,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100",
    growth: "+13%",
    isPositive: true,
  },
  {
    id: 2,
    title: "Lorem ipsum",
    value: "134,640.00",
    subtitle: "13% Lorem ipsum",
    icon: Shield,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-100",
    growth: "+13%",
    isPositive: true,
  },
  {
    id: 3,
    title: "Lorem ipsum",
    value: "2",
    subtitle: "Lorem ipsum",
    icon: Clock,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-100",
    counts: [
      { value: "3", color: "text-red-500" },
      { value: "8", color: "text-green-500" },
    ],
  },
];

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card key={stat.id} className="relative bg-white shadow-sm border border-gray-100 rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
              </Button>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <p className="text-sm text-gray-500">{stat.subtitle}</p>
                  </div>
                  {stat.growth && (
                    <span className={`text-sm font-medium ${
                      stat.isPositive ? "text-green-600" : "text-red-600"
                    }`}>
                      {stat.growth}
                    </span>
                  )}
                  {stat.counts && (
                    <div className="flex space-x-6">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-red-500">3</span>
                        <p className="text-xs text-gray-500">Lorem ipsum</p>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-bold text-green-500">8</span>
                        <p className="text-xs text-gray-500">Lorem ipsum</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}