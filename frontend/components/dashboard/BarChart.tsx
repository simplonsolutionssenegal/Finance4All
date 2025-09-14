"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";

const data = [
  { month: "01", value: 600 },
  { month: "02", value: 400 },
  { month: "03", value: 800 },
  { month: "04", value: 900 },
  { month: "05", value: 500 },
  { month: "06", value: 450 },
  { month: "07", value: 350 },
  { month: "08", value: 650 },
  { month: "09", value: 200 },
];

export default function DashboardBarChart() {
  return (
    <Card className="bg-teal-600 text-white shadow-sm rounded-2xl border-0">
      <CardContent className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <span className="text-3xl font-bold text-white">1000</span>
          </div>
          <div className="flex justify-between items-center text-sm text-white/80">
            <span>800</span>
            <span>600</span>
            <span>400</span>
            <span>200</span>
            <span>0</span>
          </div>
        </div>

        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "white" }}
              />
              <YAxis hide />
              <Bar
                dataKey="value"
                fill="rgba(255, 255, 255, 0.9)"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}