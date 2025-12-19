import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { Vacation } from "../vacation";

export function useVacations() {
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVacations = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("vacations")
      .select("*")
      .eq("archived", false)
      .order("id", { ascending: false });
    if (!error && data) setVacations(data as Vacation[]);
    else setError(error?.message || "Failed to fetch vacations");
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  const addVacation = async (vac: Omit<Vacation, "id">) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("vacations").insert([vac]);
    if (!error) fetchVacations();
    else setError(error.message);
    setLoading(false);
  };

  const updateVacation = async (vac: Vacation) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("vacations")
      .update({
        name: vac.name,
        start_date: vac.start_date,
        end_date: vac.end_date,
      })
      .eq("id", vac.id);
    if (!error) fetchVacations();
    else setError(error.message);
    setLoading(false);
  };

  // Archive vacation instead of deleting
  const archiveVacation = async (id: number) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("vacations")
      .update({ archived: true })
      .eq("id", id);
    if (!error) fetchVacations();
    else setError(error.message);
    setLoading(false);
  };

  return {
    vacations,
    loading,
    error,
    fetchVacations,
    addVacation,
    updateVacation,
    archiveVacation,
  };
}
