import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Candidate = Tables<"candidates">;
export type JobDescription = Tables<"job_descriptions">;
export type Assessment = Tables<"assessments">;

export const candidatesQuery = queryOptions({
  queryKey: ["candidates"],
  queryFn: async (): Promise<Candidate[]> => {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const jdsQuery = queryOptions({
  queryKey: ["job_descriptions"],
  queryFn: async (): Promise<JobDescription[]> => {
    const { data, error } = await supabase
      .from("job_descriptions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const assessmentsQuery = queryOptions({
  queryKey: ["assessments"],
  queryFn: async (): Promise<Assessment[]> => {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("sent_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}
