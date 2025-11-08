import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  const sleeve_indexes = (ns.args.length > 0) ? ns.args.map(a => Number(a)) : [...Array(ns.sleeve.getNumSleeves()).keys()];
  for (const index of sleeve_indexes) {
    let money_spent = 0;
    let augments_purchased = 0;
    for (const augment of ns.sleeve.getSleevePurchasableAugs(index)) {
      if (ns.sleeve.purchaseSleeveAug(index, augment.name)) {
        money_spent += augment.cost;
        augments_purchased += 1;
      }
    }
    ns.tprintf("There were %s augments purchased for sleeve %s costing $%s", augments_purchased.toString().padStart(3, "0"), index, ns.format.number(money_spent));
  }
}
