"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const institutions = [
  {
    id: 1,
    name: "Lorem ipsum",
    type: "Lorem ipsum",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Lorem ipsum",
    type: "Lorem ipsum",
    status: "INACTIVE",
  },
  {
    id: 3,
    name: "Lorem ipsum",
    type: "Lorem ipsum",
    status: "ACTIVE",
  },
];

export default function InstitutionsList() {
  return (
    <Card className="bg-white shadow-sm border border-gray-100 rounded-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Instituts financières
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-4">
          {institutions.map((institution) => (
            <div
              key={institution.id}
              className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <span className="text-sm font-medium text-gray-900">{institution.name}</span>
                  <span className="text-sm text-gray-500">{institution.type}</span>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={
                  institution.status === "ACTIVE"
                    ? "bg-green-100 text-green-700 hover:bg-green-100 border-0"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-100 border-0"
                }
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  institution.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"
                }`} />
                {institution.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}