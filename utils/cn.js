/**
 * utils/cn.js — React Native compatible
 *
 * clsx + tailwind-merge work fine with NativeWind class names.
 * No changes needed from the web version.
 */
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
