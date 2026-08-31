import React from 'react';
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';

const RouteErrorBoundary = () => {
  const error = useRouteError();
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;
  const title = isNotFound ? 'Page Not Found' : 'Something Went Wrong';
  const description = isNotFound
    ? 'The page you requested does not exist or may have moved.'
    : 'Please return to the shop and try again. Your account and order data are safe.';

  return (
    <main className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#D4AF37]">Aparna Aura</p>
      <h1 className="font-heading text-4xl font-bold text-[#382135]">{title}</h1>
      <p className="mt-4 text-gray-600">{description}</p>
      <Link to="/" className="mt-8 rounded-lg bg-[#382135] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#2a1827]">
        Return Home
      </Link>
    </main>
  );
};

export default RouteErrorBoundary;
