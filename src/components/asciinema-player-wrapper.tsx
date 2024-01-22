'use client'

import React, { useEffect, useRef, useState } from 'react';
import 'asciinema-player/dist/bundle/asciinema-player.css';

// Reference: https://github.com/asciinema/asciinema-player/issues/72#issuecomment-1287783265

type AsciinemaPlayerWrapperProps = {
  src: string;
  // START asciinemaOptions
  cols?: string;
  rows?: string;
  autoPlay?: boolean
  preload?: boolean;
  loop?: boolean | number;
  startAt?: number | string;
  speed?: number;
  idleTimeLimit?: number;
  theme?: string;
  poster?: string;
  fit?: string;
  fontSize?: string;
  // END asciinemaOptions
}

export function AsciinemaPlayerWrapper({src, ...asciinemaOptions}: AsciinemaPlayerWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [player, setPlayer] = useState<any>()

  useEffect(() => {
    // @ts-ignore
    import("asciinema-player").then(setPlayer)
  }, [])
  useEffect(() => {
    const instance = player?.create(src, ref.current, asciinemaOptions)
    return () => instance?.dispose()
  }, [src, player, asciinemaOptions])

  return <div ref={ref}/>
}
