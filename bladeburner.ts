import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  while (true) {
    let next_op = ns.bladeburner.getNextBlackOp()
    let player_rank = ns.bladeburner.getRank()
    let bladeburner_action = ns.bladeburner.getCurrentAction();
    if (bladeburner_action?.name !== next_op?.name) {
      if (next_op != null && next_op?.rank < player_rank) {
        ns.bladeburner.startAction("Black Operations", next_op?.name)
      } else if (bladeburner_action === null) {
        ns.bladeburner.startAction("Operations", "Assassination")
      }
    }
    await ns.asleep(10_000)
  }
}
