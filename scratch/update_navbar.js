const fs = require('fs');
let content = fs.readFileSync('src/components/layout/navbar.tsx', 'utf8');

// Also import extra icons
content = content.replace("import { Menu, Search, User, Globe, Home, Building2, CalendarDays, Heart, MessageSquare, Plus, Shield, Settings, LogOut } from 'lucide-react';", 
"import { Menu, Search, User, Globe, Home, Building2, CalendarDays, Heart, MessageSquare, Plus, Shield, Settings, LogOut, Calendar, Star, BarChart3 } from 'lucide-react';");

const hostMenu = `
                      {isHostDashboard && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/host/dashboard" className="cursor-pointer">
                              <Building2 className="mr-2 h-4 w-4" /> Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/host/reservations" className="cursor-pointer">
                              <CalendarDays className="mr-2 h-4 w-4" /> Rentals
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/host/calendar" className="cursor-pointer">
                              <Calendar className="mr-2 h-4 w-4" /> Calendar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/messages" className="cursor-pointer">
                              <MessageSquare className="mr-2 h-4 w-4" /> Messages
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/host/reviews" className="cursor-pointer">
                              <Star className="mr-2 h-4 w-4" /> Reviews
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/host/analytics" className="cursor-pointer">
                              <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/host/listings/new" className="cursor-pointer">
                              <Plus className="mr-2 h-4 w-4" /> Create listing
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
`;

content = content.replace(/\{isHostDashboard && \(\s*<DropdownMenuItem asChild>\s*<Link href="\/host\/listings\/new" className="cursor-pointer">\s*<Plus className="mr-2 h-4 w-4" \/> Create listing\s*<\/Link>\s*<\/DropdownMenuItem>\s*\)\}/, hostMenu);

fs.writeFileSync('src/components/layout/navbar.tsx', content);
