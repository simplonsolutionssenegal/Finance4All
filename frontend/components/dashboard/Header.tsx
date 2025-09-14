"use client";

import { Search, Bell, ChevronDown } from "lucide-react";

import NoSSR from "@/components/NoSSR";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function Header() {
  return (
    <header className="w-full h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between" suppressHydrationWarning>
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3">
          <img
            src="/logo.svg"
            alt="Finance4ALL"
            className="h-8 w-auto"
          />
        </div>

        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      <NoSSR fallback={
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <div className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg bg-white">
              <span className="text-gray-400">Search...</span>
            </div>
          </div>
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              10
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center">
              J
            </div>
            <span className="text-gray-700 font-medium">Jaafar</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>
      }>
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-80 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              10
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="Jaafar" />
                  <AvatarFallback className="bg-teal-500 text-white">J</AvatarFallback>
                </Avatar>
                <span className="text-gray-700 font-medium">Jaafar</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </NoSSR>
    </header>
  );
}