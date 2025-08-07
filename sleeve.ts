import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  let loop_count = 0;
  const sleeve_timing = 30;
  const sleeve_thresholds = { "shock": 30, "sync": 99 }
  do {
    if (ns.sleeve.getNumSleeves() > 0 && loop_count % sleeve_timing == 0) {
      for (let sleeve_index = 0; sleeve_index < ns.sleeve.getNumSleeves(); sleeve_index++) {
        const sleeve = ns.sleeve.getSleeve(sleeve_index);
        if (sleeve.shock >= sleeve_thresholds.shock) {
          ns.sleeve.setToShockRecovery(sleeve_index);
        } else if (sleeve.sync <= sleeve_thresholds.sync) {
          ns.sleeve.setToSynchronize(sleeve_index);
        }
      }
    }

    await ns.sleep(1000)
    loop_count += 1;
  } while (true);
}
