import React, { useState, useEffect } from "react";
import { UserContext } from "./context";
import { supabase } from "./supabaseClient";
import NavBar from "./components/NavBar";
import { VacationCalendar } from "./pages/VacationCalendar";
import VacationEditModal from "./VacationEditModal";
import { VacationDetails } from "./pages/VacationDetails";
import AccountPage from "./pages/AccountPage";
import "./styles/App.css";
import { darkTheme, lightTheme } from "./styles/theme";
import { useVacations, useAddVacation } from "./hooks/useVacations";
import VacationListItem from "./VacationListItem";
import AuthForm from "./components/AuthForm";
import VacationAddModal from "./VacationAddModal";
import { handleArchiveVacation, handleArchiveRestore } from "./utils/handlers";

interface Vacation {
  id: number;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  archived?: boolean;
}

interface AppProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

function App({ user, setUser }: AppProps) {
  const {
    vacations,
    loading: vacationsLoading,
    fetchVacations,
  } = useVacations(
    () => {},
    () => {}
  );

  const { addVacation, loading: addVacationLoading } = useAddVacation(
    fetchVacations,
    () => {}
  );

  const loading = vacationsLoading || addVacationLoading;

  // State variables
  const [loadingUser, setLoadingUser] = useState(true);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingVacation, setEditingVacation] = useState<Vacation | null>(null);
  const [editingVacationValues, setEditingVacationValues] =
    useState<Vacation | null>(null);
  const [selectedVacation, setSelectedVacation] = useState<Vacation | null>(
    null
  );
  const [dbStatus, setDbStatus] = useState("checking");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "reset">(
    "login"
  );
  const [showAddVacationModal, setShowAddVacationModal] = useState(false);

  const themeVars = theme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    fetchVacations(showArchived);
  }, [showArchived, fetchVacations]);

  // Check database connection
  useEffect(() => {
    async function checkDbConnection() {
      setDbStatus("checking");
      try {
        const { error } = await supabase
          .from("vacations")
          .select("id")
          .limit(1);
        if (error) {
          setDbStatus("error");
        } else {
          setDbStatus("ok");
        }
      } catch (err) {
        setDbStatus("error");
      }
    }
    checkDbConnection();
  }, []);

  // Authentication state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoadingUser(false);
      }
    );
    return () => listener?.subscription.unsubscribe();
  }, [setUser]);

  // Save vacation edits
  function handleSaveVacation(e: React.FormEvent) {
    e.preventDefault();
    if (!editingVacation || !editingVacationValues) return;

    supabase
      .from("vacations")
      .update({
        name: editingVacationValues.name,
        destination: editingVacationValues.destination,
        start_date: editingVacationValues.start_date,
        end_date: editingVacationValues.end_date,
      })
      .eq("id", editingVacation.id)
      .then(({ error }) => {
        if (!error) fetchVacations();
        else console.error("Error updating vacation:", error);
        setEditingVacation(null);
      });
  }

  // Open vacation edit modal
  function openEditVacationModal(vacation: Vacation) {
    setEditingVacation(vacation);
    setEditingVacationValues({ ...vacation });
  }

  // Filter vacations
  const filteredVacations = vacations.filter((vacation) => {
    const query = search.toLowerCase();
    return (
      vacation.name.toLowerCase().includes(query) ||
      vacation.destination.toLowerCase().includes(query)
    );
  });

  const displayedVacations = filteredVacations.filter(
    (vacation) => showArchived || !vacation.archived
  );

  // Render loading states
  if (loading || loadingUser) return <p>Loading...</p>;

  // Render account page
  if (showAccount && user) {
    return (
      <UserContext.Provider value={{ user }}>
        <div className="vp-main">
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: themeVars.background,
              zIndex: -1,
            }}
            aria-hidden="true"
          />
          <NavBar
            onCalendarToggle={() => setShowCalendar((prev) => !prev)}
            themeVars={themeVars}
            theme={theme}
            setTheme={setTheme}
            user={user}
            setShowAccount={setShowAccount}
            setShowCalendar={setShowCalendar}
            setShowAuthModal={setShowAuthModal}
            handleLogout={async () => {
              await supabase.auth.signOut();
              setUser(null);
              setShowAccount(false);
            }}
          />
          <div className="vp-content">
            <AccountPage
              user={user}
              onLogout={async () => {
                await supabase.auth.signOut();
                setUser(null);
                setShowAccount(false);
              }}
              onHome={() => {
                setShowAccount(false);
                setShowCalendar(true);
              }}
              themeVars={themeVars}
            />
          </div>
        </div>
      </UserContext.Provider>
    );
  }

  // Main application layout
  return (
    <UserContext.Provider value={{ user }}>
      <div className="vp-main">
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: themeVars.background,
            zIndex: -1,
          }}
          aria-hidden="true"
        />
        <NavBar
          onCalendarToggle={() => setShowCalendar((prev) => !prev)}
          themeVars={themeVars}
          theme={theme}
          setTheme={setTheme}
          user={user}
          setShowAccount={setShowAccount}
          setShowCalendar={setShowCalendar}
          setShowAuthModal={setShowAuthModal} // Pass the setShowAuthModal prop
          handleLogout={async () => {
            await supabase.auth.signOut();
            setUser(null);
            setShowAccount(false);
          }}
        />
        {dbStatus === "error" && (
          <div style={{ color: "red" }}>
            Error connecting to the database. Some features may not work.
          </div>
        )}
        {showCalendar && (
          <VacationCalendar
            vacations={vacations}
            onVacationClick={setEditingVacation}
            onEditVacation={() => {}} // Replaced `pushUndo` with an empty function
          />
        )}
        {editingVacation && (
          <VacationEditModal
            vacation={editingVacation}
            values={editingVacationValues}
            onChange={(values) => setEditingVacationValues(values)}
            onSave={handleSaveVacation}
            onClose={() => setEditingVacation(null)}
            themeVars={themeVars}
          />
        )}
        {showAddVacationModal && (
          <VacationAddModal
            onClose={() => setShowAddVacationModal(false)}
            onSubmit={addVacation}
            themeVars={themeVars}
            style={{
              maxWidth: "500px",
              maxHeight: "80%",
              overflowY: "auto",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          />
        )}
        <div className="vp-content">
          <aside className="vp-sidebar">
            <h2>Your Vacations</h2>
            <button
              onClick={() => setShowAddVacationModal(true)}
              className="vp-button"
            >
              Add Vacation
            </button>
            <input
              type="text"
              placeholder="Search vacations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="vp-input"
            />
            <label>
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
              Show Archived Vacations
            </label>
            <ul>
              {displayedVacations.map((vacation) => (
                <VacationListItem
                  key={vacation.id}
                  vacation={vacation}
                  selected={selectedVacation?.id === vacation.id}
                  themeVars={themeVars}
                  onSelect={() => setSelectedVacation(vacation)}
                  onEdit={openEditVacationModal}
                  onDelete={() =>
                    handleArchiveVacation(
                      vacation,
                      () => {}, // Placeholder for pushUndo
                      fetchVacations,
                      (toast) => console.log(toast) // Placeholder for setToast
                    )
                  }
                  onRestore={() =>
                    handleArchiveRestore(
                      vacation, // Pass the entire vacation object
                      fetchVacations,
                      (toast) => console.log(toast) // Placeholder for setToast
                    )
                  }
                />
              ))}
            </ul>
          </aside>
          <main className="vp-main-content">
            {selectedVacation && (
              <div className="vp-details">
                <VacationDetails
                  vacationId={selectedVacation.id}
                  theme={theme}
                  user={user}
                />
              </div>
            )}
          </main>
        </div>
        <footer className="vp-footer">© 2025 Vacation Planner</footer>

        {showAuthModal && (
          <div className="auth-modal-wrapper">
            <AuthForm
              themeVars={themeVars}
              mode={authMode}
              setMode={setAuthMode}
              errorMsg={null}
              onAuth={(err) => {
                if (!err) setShowAuthModal(false);
              }}
            />
          </div>
        )}
      </div>
    </UserContext.Provider>
  );
}

export default App;
