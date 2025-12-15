"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-medium text-white bg-white/20 hover:bg-white/30 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 border border-white/30"
    >
      Logout
    </button>
  );
}

