import React, { useEffect, useMemo, useRef } from "react";
import { useWindowSize } from "react-use";
import videojs from "video.js";
// Styles
import "video.js/dist/video-js.css";

interface IVideoPlayerProps {
  options?: videojs.PlayerOptions;
  fileName: string;
}

const VideoPlayer: React.FC<IVideoPlayerProps> = ({ options, fileName }) => {
  const { width, height } = useWindowSize();
  const videoNode = useRef<any>();
  const player = useRef<videojs.Player>();

  const initialOptions: videojs.PlayerOptions = useMemo(() => {
    return {
      controls: true,
      preload: "true",
      //   fuild: true,
      responsive: true,
      width: width - 120,
      height: height - 250,
      //   aspectRatio: "4:3",
      controlBar: {
        volumePanel: {
          inline: false,
        },
      },
    };
  }, [height, width]);

  useEffect(() => {
    player.current = videojs(videoNode.current, {
      ...initialOptions,
      ...options,
    }).ready(function () {
      console.log("onPlayerReady");
    });

    return () => {
      if (player.current) {
        player.current.dispose();
      }
    };
  }, [initialOptions, options]);

  return (
    <div className="flex items-center">
      <video ref={videoNode} className="video-js vjs-default-skin">
        <source
          src={`http://localhost/live/${fileName}/index.m3u8`}
          type="application/x-mpegURL"
        />
      </video>
    </div>
  );
};

export default VideoPlayer;
