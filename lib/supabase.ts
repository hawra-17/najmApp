import { createClient } from "@supabase/supabase-js";

// Replace with your Supabase credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    "Missing Supabase env vars. Check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface IncidentData {
  location: string;
  severity: "High" | "Moderate" | "Low";
  status: "Active" | "Resolved" | "Pending";
  hasInjury: boolean;
  isCarAccident: boolean;
  nationalId: string;
}

export interface SubmitIncidentResult {
  data: any | null;
  error: string | null;
}

export const submitIncidentReport = async (
  data: IncidentData,
): Promise<SubmitIncidentResult> => {
  try {
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0]; // HH:MM:SS

    // Determine severity based on injury and incident type
    let severity: "High" | "Moderate" | "Low" = "Low";
    if (data.hasInjury) {
      severity = "High";
    } else if (data.isCarAccident) {
      severity = "Moderate";
    }

    const response = await supabase
      .from("incidents")
      .insert([
        {
          date,
          time,
          location: data.location,
        },
      ])
      .select();

    if (response.error) {
      const message = `${response.error.message}${
        response.error.details ? ` | ${response.error.details}` : ""
      }`;
      console.error("Error submitting incident:", message);
      return { data: null, error: message };
    }

    // Return the created incident with incident_id
    return { data: response.data?.[0] || null, error: null };
  } catch (error) {
    console.error("Failed to submit incident:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
