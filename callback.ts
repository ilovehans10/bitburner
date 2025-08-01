import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.spawn("start_script.js", 1, true)
}
