"use client"

import {useEffect} from "react"
import {track} from "./track"

export function NotFoundTracker() {
  useEffect(() => {
    track("404")
  }, [])

  return null
}

export default NotFoundTracker
