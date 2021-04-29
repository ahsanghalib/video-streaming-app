import React from "react";
import { useTokenStore } from "../stores";
import Headers from "./Headers";

interface Props {}

const Layout: React.FC<Props> = ({ children }) => {
  const hasToken = useTokenStore((s) => !!s.accessToken);

  if (hasToken) {
    return (
      <div className="mx-6 my-14 bg-white rounded p-6">
        <Headers />
        <div className="mt-6">{children}</div>
      </div>
    );
  }

  return <div>{children}</div>;
};

export default Layout;
