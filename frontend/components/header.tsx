"use client";
'use client';

import { Bell, Search } from "lucide-react";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";


export default function Header() {
    return (
        // <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <header className="sticky top-0 z-50 w-full  border-b-[1.5px] border-[#EAEAEA] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-15 items-center justify-between px-4">
                {/* Logo et Dashboard */}
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        {/* Logo */}
                        <Image
                            src="/finance4all.png"
                            alt="Logo"
                            width={200}
                            height={32}
                            className="h-10 w-50 rounded-lg"
                        />
                        <span className="ml-6 text-xl font-bold">Dashboard</span>
                    </div>
                </div>

                {/* Barre de recherche - cachée sur mobile */}
                <div className="hidden md:flex flex-1 max-w-xs mx-8">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search..."
                            className="pl-10 border-[1.5px] border-[#EAEAEA]
             focus-visible:ring-0 focus-visible:ring-offset-0
             focus-visible:border-[#EAEAEA]
             focus:ring-0 focus:border-[#EAEAEA]"
                        />

                    </div>
                </div>

                {/* Actions à droite */}
                <div className="flex items-center space-x-4">
                    {/* Barre de recherche mobile */}
                    {/* <Button variant="ghost" size="icon" >
                        <Search className="h-5 w-5" />
                    </Button> */}

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative bg-[#EAEAEA] rounded-full">
                                <Bell className="h-5 w-5" />
                                <Badge
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-[#7DB7CA] text-red-600 rounded-full"
                                >
                                    3
                                </Badge>
                            </Button>

                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">Nouvelle commande</p>
                                    <p className="text-xs text-muted-foreground">Il y a 5 minutes</p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">Mise à jour système</p>
                                    <p className="text-xs text-muted-foreground">Il y a 1 heure</p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">Nouveau message</p>
                                    <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Profil utilisateur */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 px-3 py-2">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=32&h=32&fit=crop&crop=face" alt="Utilisateur" />
                                        <AvatarFallback>JD</AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:flex flex-col items-start">
                                        <span className="text-sm font-medium">John Doe</span>
                                        {/* <span className="text-xs text-muted-foreground">Admin</span> */}
                                    </div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">John Doe</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        john.doe@example.com
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profil</DropdownMenuItem>
                            <DropdownMenuItem>Paramètres</DropdownMenuItem>
                            <DropdownMenuItem>Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                                Se déconnecter
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}