import React from "react";
import { supabase } from "../../src/supabaseClient";
import { StyledInput, StyledButton } from "../../src/ui";
import "../styles/AccountPage.css";

type AccountPageProps = {
  user: any;
  onLogout: () => void;
  onHome: () => void;
  themeVars: any;
};

export default function AccountPage({
  user,
  onLogout,
  onHome,
  themeVars,
}: AccountPageProps) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [displayName, setDisplayName] = React.useState(
    user?.user_metadata?.display_name || ""
  );

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    // Re-authenticate user with current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      console.error("Current password is incorrect.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) console.error(error.message);
    else console.log("Password updated!");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <div className="vp-main">
      <div className="account-page">
        <h1>Account</h1>
        <p>Email: {user.email}</p>

        <div className="form-group">
          <label htmlFor="displayName">Display Name</label>
          <StyledInput
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            themeVars={themeVars}
          />
          <StyledButton onClick={() => {}} themeVars={themeVars}>
            Update Display Name
          </StyledButton>
        </div>

        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <StyledInput
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            themeVars={themeVars}
          />
          <label htmlFor="newPassword">New Password</label>
          <StyledInput
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            themeVars={themeVars}
          />
          <StyledButton onClick={handleUpdatePassword} themeVars={themeVars}>
            Update Password
          </StyledButton>
        </div>

        <div className="action-buttons">
          <StyledButton onClick={onHome} themeVars={themeVars}>
            Home
          </StyledButton>
          <StyledButton
            onClick={onLogout}
            className="logout-button"
            themeVars={themeVars}
          >
            Log Out
          </StyledButton>
        </div>
      </div>
    </div>
  );
}
