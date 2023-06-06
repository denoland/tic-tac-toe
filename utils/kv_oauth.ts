import "$std/dotenv/load.ts";
import { createClient } from "kv_oauth";

export const client = createClient("github");
