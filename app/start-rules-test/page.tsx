'use client';

import { useEffect } from 'react';

export default function RedirectPage() {
  useEffect(() => {
    // Fetch the first client (Vacation Rentals Inc)
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) {
          const clientId = data[0].id;
          localStorage.setItem('currentClientId', clientId);
          window.location.href = `/auto-rules?clientId=${clientId}`;
        }
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">Loading Auto-Rules...</p>
      </div>
    </div>
  );
}
