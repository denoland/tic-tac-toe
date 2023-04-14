interface GitHubUser {
  id: number;
  login: string;
  name: string;
  avatar_url: string;
}

export async function getAuthenticatedUser(token: string): Promise<GitHubUser> {
  const resp = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("Failed to fetch user");
  }
  return await resp.json();
}
