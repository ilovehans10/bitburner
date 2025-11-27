import { quiet_methods } from "library.js";
import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {

  quiet_methods(ns, ["disableLog", "sleep", "singularity.upgradeHomeRam"]);
  let loop_count = 0;
  let committing_crimes = false;
  let gang_setup_needed = true;
  const upgrade_timing = 60;
  const gang_timing = 30;
  const upgrade_threshold_multiplier = 2;
  const combat_skills = [ns.enums.GymType.strength, ns.enums.GymType.dexterity, ns.enums.GymType.defense, ns.enums.GymType.agility];
  do {
    if (loop_count % upgrade_timing == 0) {
      if (ns.singularity.getUpgradeHomeRamCost() <= (ns.getPlayer().money * upgrade_threshold_multiplier)) {
        ns.singularity.upgradeHomeRam();
      }
    }
    if (gang_setup_needed && loop_count % gang_timing == 0) {
      if (ns.heart.break() > -54_000) {
        const is_focused = ns.singularity.isFocused();
        if (ns.singularity.getCrimeChance("Homicide") < 0.95) {
          const combat_choice = combat_skills[(loop_count / gang_timing) % 4];
          ns.singularity.gymWorkout("Powerhouse Gym", combat_choice, is_focused);
        } else if (!committing_crimes) {
          ns.singularity.commitCrime("Homicide", is_focused);
          committing_crimes = true;
        }
      } else {
        if (ns.getPlayer().factions.includes("Slum Snakes")) {
          gang_setup_needed = !ns.gang.createGang("Slum Snakes");
          if (gang_setup_needed) ns.write("json/gang_type.json", JSON.stringify("Combat"), "w");
        } else {
          gang_setup_needed = !ns.gang.createGang("NiteSec");
          if (gang_setup_needed) ns.write("json/gang_type.json", JSON.stringify("Hack"), "w");
        }
      }
    }
    await ns.sleep(1_000);
    loop_count += 1;
  } while (true);
}
