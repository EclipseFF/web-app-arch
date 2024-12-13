import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {json} from "node:stream/consumers";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const langs = [
  {
    value: "ru",
    label: "Русский",
  },
  {
    value: "kaz",
    label: "Қазақ",
  },
  {
    value: "en",
    label: "English",
  },
]