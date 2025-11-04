import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  const sleeve_indexes = (ns.args.length > 0) ? ns.args.map(a => Number(a)) : [...Array(ns.sleeve.getNumSleeves()).keys()];
  for (const index of sleeve_indexes) {
    for (const augment of ns.sleeve.getSleevePurchasableAugs(index)) {
      ns.sleeve.purchaseSleeveAug(index, augment.name);
    }
  }
}
