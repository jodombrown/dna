
import React from "react";

const ProfileSignInPanel = () => (
  <div className="flex h-[60vh] flex-col items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-dna-forest mb-3">
        Join Africa’s Diaspora Community!
      </h2>
      <div className="text-lg text-dna-copper mb-2">
        Connect, collaborate, and help shape the future of African impact worldwide.
      </div>
      <div className="mb-6 text-gray-600 text-base">
        Ready to make meaningful connections and advance your goals?
        <br />
        <span className="font-semibold">Sign in or join us to unlock the DNA network and community resources!</span>
        <br />
        Already have an account? <a href="/auth?mode=signin" className="underline text-dna-copper">Sign in here</a>.
        <br />
        New here?
        <a href="/auth?mode=signup" className="underline text-dna-emerald ml-1">Join now</a>—it's fast, free and impactful!
      </div>
      <a
        href="/auth"
        className="inline-block px-6 py-3 rounded-full bg-dna-emerald hover:bg-dna-forest transition-colors text-white font-semibold text-lg shadow-md"
      >
        Sign In / Join the DNA Network
      </a>
    </div>
  </div>
);

export default ProfileSignInPanel;
