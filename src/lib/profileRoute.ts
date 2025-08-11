export const profileRoute = (u?: { username?: string | null }) => (u?.username ? `/dna/${u.username}` : undefined);
