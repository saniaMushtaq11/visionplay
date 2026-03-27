import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const useNavigation = () => {
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  const { toast } = useToast();
  const navigate = useNavigate();

  const navigateTo = useCallback((section: string, showToast: boolean = false) => {
    setActiveSection(section);
    const routeMap: Record<string, string> = {
      dashboard: '/',
      matches: '/matches',
      connections: '/connections',
      events: '/events',
      coach: '/coach',
      profile: '/profile',
      login: '/login',
      myposts: '/myposts',
      admin: '/admin',
    };
    const to = routeMap[section] ?? '/';
    navigate(to);
    
    if (showToast) {
      const sectionNames: Record<string, string> = {
        dashboard: 'Dashboard',
        matches: 'Matches',
        connections: 'Connections',
        events: 'Events',
        coach: 'AI Coach',
        profile: 'Profile',
        login: 'Login',
        myposts: 'My Posts',
        admin: 'Admin Panel'
      };

      toast({
        title: `Navigating to ${sectionNames[section] || section}`,
        description: "This is a demo. Full functionality available after Supabase integration.",
        duration: 2000,
      });
    }
  }, [toast]);

  const handleSearch = useCallback((query: string) => {
    toast({
      title: "Search functionality",
      description: `Searching for: "${query}". Connect to Supabase for full search capabilities.`,
      duration: 3000,
    });
  }, [toast]);

  return {
    activeSection,
    navigateTo,
    handleSearch
  };
};