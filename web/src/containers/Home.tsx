import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useStreamingUsers } from "../stores";
import { wsend } from "../utils/createWebSocket";
import { Oper } from "../utils/types";

interface Props {}

const Home: React.FC<Props> = () => {
  const streamUsers = useStreamingUsers((s) => s.streamUsers);

  useEffect(() => {
    wsend({
      op: Oper.get_streaming_sessions,
      d: {},
    });
  }, []);

  return (
    <div>
      {streamUsers.length > 0 ? (
        <>
          <b>Streaming Users [Total users: {streamUsers.length}]</b>
          <br />
          <br />
          {streamUsers.map((s, i) => (
            <div key={s.fileName} className="flex gap-4">
              <div>
                {i + 1}: <b>{s.userName}</b> is streaming.{" "}
                <Link to={`/live/${s.fileName}`} className="underline">
                  To Watch Click Here
                </Link>
              </div>
            </div>
          ))}
        </>
      ) : (
        <b>No User is streaming...</b>
      )}
    </div>
  );
};

export default Home;
