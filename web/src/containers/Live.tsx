import React, { useEffect } from "react";
import { useHistory, useParams } from "react-router";
import VideoPlayer from "../components/VideoPlayer";

interface Props {}

const Live: React.FC<Props> = () => {
  const { id } = useParams<any>();
  const history = useHistory();

  useEffect(() => {
    if (!id) {
      history.push("/");
    }
  }, [history, id]);

  return (
    <div>
      <b>Live</b>
      <br />
      <div className="flex w-full justify-center items-start">
        <VideoPlayer fileName={id} />
      </div>
    </div>
  );
};

export default Live;
