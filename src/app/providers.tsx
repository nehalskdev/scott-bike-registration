"use client";

import React, { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Application providers wrapper
 */
export function Providers({ children }: ProvidersProps): React.JSX.Element {
  return <>{children}</>;
}
