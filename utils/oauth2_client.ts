import "$std/dotenv/load.ts";
import { createGitHubOAuth2Client } from "kv_oauth";

export const oauth2Client = createGitHubOAuth2Client();
