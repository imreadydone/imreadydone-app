"use client";

import { useEffect, useState } from "react";

const PRIORITY_EMOJI: Record<string, string> = {
  urgent: "◆",
  high: "▲",
  medium: "■",
  low: "○",
};

const STATUS_EMOJI: Record<string, string> = {
  pending: "[ ]",
  "in-progress": "[~]",
  done: "[✓]",
};

export default function Home() {
  return <div>Test</div>;
}
