export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://visionplay-anin.onrender.com';
console.log("API_BASE_URL:", API_BASE_URL);
export const FOOTBALL_API_KEY = (import.meta as any).env?.VITE_FOOTBALL_API_KEY || "";
export const FOOTBALL_API_BASE_URL = "https://api.football-data.org/v4";
export const RAPIDAPI_KEY = (import.meta as any).env?.VITE_RAPIDAPI_KEY || "";
export const RAPIDAPI_HOST = "api-football-v1.p.rapidapi.com";

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  console.log(`Making API request to: ${path}`);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      ...init,
    });
    
    console.log(`API response status: ${response.status} for ${path}`);
    
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`API request failed: ${path}`, { status: response.status, body: text });
      throw new Error(`Request failed ${response.status}: ${text}`);
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API request error for ${path}:`, error);
    throw error;
  }
}

export const api = {
  deletePost: (postId: string) =>
    http<void>(`/posts/${postId}`, {
      method: "DELETE"
    }),
  health: () => http<{ status: string }>("/health"),
  players: () => http<any[]>("/players"),
  matches: () => http<any[]>("/matches"),
  tryouts: () => http<any[]>("/tryouts"),
  // Auth
  signup: (email: string, password: string, name?: string) =>
    http<{ token: string; user: { id: string; email: string; name?: string } }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    http<{ token: string; user: { id: string; email: string; name?: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  googleAuth: (credential: string) => {
    console.log("Sending Google auth request to backend", { credentialLength: credential.length });
    return http<{ token: string; user: { id: string; email: string; name?: string } }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }).catch(error => {
      console.error("Google auth API request failed:", error);
      throw error;
    });
  },
  me: () => http<{ user: { id: string; email: string; name?: string } }>("/auth/me"),
  getProfile: () => http<any>("/profile"),
  updateProfile: (profileData: any) =>
    http<{ status: string; profile: any }>("/profile", {
      method: "POST",
      body: JSON.stringify(profileData),
    }),
  connect: (playerId: string, action: "connect" | "disconnect") =>
    http<{ status: string; playerId: string; connected: boolean }>("/connect", {
      method: "POST",
      body: JSON.stringify({ playerId, action }),
    }),
  message: (playerId: string, message?: string) =>
    http<{ status: string; playerId: string }>("/message", {
      method: "POST",
      body: JSON.stringify({ playerId, message }),
    }),
  applyTryout: (tryoutId: string) =>
    http<{ status: string; tryoutId: string; applied: boolean }>("/tryouts/apply", {
      method: "POST",
      body: JSON.stringify({ tryoutId }),
    }),
  saveTryout: (tryoutId: string) =>
    http<{ status: string; tryoutId: string; saved: boolean }>("/tryouts/save", {
      method: "POST",
      body: JSON.stringify({ tryoutId }),
    }),
  notifyMatch: (matchId: string) =>
    http<{ status: string; matchId: string; notified: boolean }>("/matches/notify", {
      method: "POST",
      body: JSON.stringify({ matchId }),
    }),
  watchMatch: (matchId: string) =>
    http<{ status: string; matchId: string; watch: boolean }>("/matches/watch", {
      method: "POST",
      body: JSON.stringify({ matchId }),
    }),
  getMyPosts: () => http<any[]>("/posts/mine"),
};

// Football API functions
async function footballApiRequest<T>(path: string): Promise<T> {
  const proxiedUrl = `${API_BASE_URL}/proxy/football-data?path=${encodeURIComponent(path)}`;
  const response = await fetch(proxiedUrl, {
    headers: {
      "X-Auth-Token": FOOTBALL_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Football API request failed ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const footballApi = {
  // Competitions
  getCompetitions: () => footballApiRequest<any[]>("/competitions"),
  getCompetition: (id: string) => footballApiRequest<any>(`/competitions/${id}`),
  getCompetitionStandings: (id: string) => footballApiRequest<any>(`/competitions/${id}/standings`),
  getCompetitionMatches: (id: string, dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    const query = params.toString();
    const path = query
      ? `/competitions/${id}/matches?${query}`
      : `/competitions/${id}/matches`;
    return footballApiRequest<any>(path);
  },
  
  // Teams
  getTeam: (id: string) => footballApiRequest<any>(`/teams/${id}`),
  getTeamMatches: (id: string, dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    return footballApiRequest<any>(`/teams/${id}/matches?${params.toString()}`);
  },
  
  // Matches
  getMatches: (dateFrom?: string, dateTo?: string, competitionId?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    if (competitionId) params.append("competitions", competitionId);
    const query = params.toString();
    const path = query ? `/matches?${query}` : `/matches`;
    return footballApiRequest<any>(path);
  },
  getMatch: (id: string) => footballApiRequest<any>(`/matches/${id}`),
  
  // Players
  getPlayer: (id: string) => footballApiRequest<any>(`/persons/${id}`),
  getPlayerMatches: (id: string, dateFrom?: string, dateTo?: string) => {
    const params = new URLSearchParams();
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    return footballApiRequest<any>(`/persons/${id}/matches?${params.toString()}`);
  },
};

// Helper function to delay execution (for retry mechanism)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// RapidAPI (api-football) helpers with retry mechanism
async function rapidFootballApiRequest<T>(path: string, retries = 2): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}/proxy/rapidapi?path=${encodeURIComponent(path)}`, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY, // Backend will use this
      },
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Rate limited - implement exponential backoff
        const backoffTime = Math.pow(2, 3 - retries) * 1000; // 2s, 4s, 8s...
        console.warn(`RapidAPI rate limit exceeded. Retrying in ${backoffTime/1000}s...`);
        await delay(backoffTime);
        return rapidFootballApiRequest(path, retries - 1);
      } else if (response.status === 429) {
        console.warn("RapidAPI rate limit exceeded. Please try again later.");
        throw new Error(`RapidAPI rate limit exceeded (429). Please try again later.`);
      } else if (response.status === 403) {
        console.warn("RapidAPI authorization failed. Please check your API key.");
        throw new Error(`RapidAPI authorization failed (403). Please check your API key.`);
      } else {
        throw new Error(`RapidAPI request failed ${response.status}: ${response.statusText}`);
      }
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.message.includes('rate limit') && retries > 0) {
      // Network errors or other issues - also retry
      const backoffTime = Math.pow(2, 3 - retries) * 1000;
      console.warn(`Request failed. Retrying in ${backoffTime/1000}s...`);
      await delay(backoffTime);
      return rapidFootballApiRequest(path, retries - 1);
    }
    throw error;
  }
}

// Free Football API Data (Creativesdev) helpers with retry mechanism
async function freeFootballApiRequest<T>(endpoint: string, retries = 2): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}/proxy/free-football/${endpoint}`, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY, // Backend will use this
      },
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Rate limited - implement exponential backoff
        const backoffTime = Math.pow(2, 3 - retries) * 1000; // 2s, 4s, 8s...
        console.warn(`Free Football API rate limit exceeded. Retrying in ${backoffTime/1000}s...`);
        await delay(backoffTime);
        return freeFootballApiRequest(endpoint, retries - 1);
      } else if (response.status === 429) {
        console.warn("Free Football API rate limit exceeded. Please try again later.");
        throw new Error(`Free Football API rate limit exceeded (429). Please try again later.`);
      } else if (response.status === 403) {
        console.warn("Free Football API authorization failed. Please check your API key.");
        throw new Error(`Free Football API authorization failed (403). Please check your API key.`);
      } else if (response.status === 404) {
        console.warn(`Free Football API endpoint not found: ${endpoint}`);
        throw new Error(`Free Football API endpoint not found (404): ${endpoint}`);
      } else {
        throw new Error(`Free Football API request failed ${response.status}: ${response.statusText}`);
      }
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.message.includes('rate limit') && retries > 0) {
      // Network errors or other issues - also retry
      const backoffTime = Math.pow(2, 3 - retries) * 1000;
      console.warn(`Request failed. Retrying in ${backoffTime/1000}s...`);
      await delay(backoffTime);
      return freeFootballApiRequest(endpoint, retries - 1);
    }
    throw error;
  }
}

export const rapidFootballApi = {
  // Head-to-head by team IDs, e.g. h2h="33-34"
  getHeadToHead: (teamIdsDashSeparated: string) =>
    rapidFootballApiRequest<any>(`/v3/fixtures/headtohead?h2h=${encodeURIComponent(teamIdsDashSeparated)}`),
  
  // Leagues and competitions
  getLeagues: (country?: string, season?: number) => {
    const params = new URLSearchParams();
    if (country) params.append("country", country);
    if (season) params.append("season", season.toString());
    const query = params.toString();
    return rapidFootballApiRequest<any>(`/v3/leagues${query ? `?${query}` : ""}`);
  },
  
  // Teams in a league
  getTeams: (league: string, season: number) =>
    rapidFootballApiRequest<any>(`/v3/teams?league=${encodeURIComponent(league)}&season=${season}`),
  
  // Standings/table
  getStandings: (league: string, season: number) =>
    rapidFootballApiRequest<any>(`/v3/standings?league=${encodeURIComponent(league)}&season=${season}`),
  
  // Fixtures/matches
  getFixtures: (league?: string, season?: number, date?: string, team?: string) => {
    const params = new URLSearchParams();
    if (league) params.append("league", league);
    if (season) params.append("season", season.toString());
    if (date) params.append("date", date);
    if (team) params.append("team", team);
    const query = params.toString();
    return rapidFootballApiRequest<any>(`/v3/fixtures${query ? `?${query}` : ""}`);
  },
  
  // Team fixtures
  getTeamFixtures: (team: string, season?: number, last?: number) => {
    const params = new URLSearchParams();
    params.append("team", team);
    if (season) params.append("season", season.toString());
    if (last) params.append("last", last.toString());
    const query = params.toString();
    return rapidFootballApiRequest<any>(`/v3/fixtures?${query}`);
  },
};

// Free Football API Data (Creativesdev) implementation
export const freeFootballApi = {
  // Get live scores
  getLiveScores: () => freeFootballApiRequest<any>("livescores"),
  
  // Get fixtures by date
  getFixturesByDate: (date: string) => freeFootballApiRequest<any>(`fixtures/date/${date}`),
  
  // Get fixtures by league
  getFixturesByLeague: (leagueId: string) => freeFootballApiRequest<any>(`fixtures/league/${leagueId}`),
  
  // Get league standings
  getLeagueStandings: (leagueId: string) => freeFootballApiRequest<any>(`standings/${leagueId}`),
  
  // Get leagues list
  getLeagues: () => freeFootballApiRequest<any>("leagues"),
  
  // Get team information
  getTeam: (teamId: string) => freeFootballApiRequest<any>(`team/${teamId}`),
  
  // Get team fixtures
  getTeamFixtures: (teamId: string) => freeFootballApiRequest<any>(`fixtures/team/${teamId}`),
};


