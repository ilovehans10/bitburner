import { quiet_methods } from "library.js"
import { NS, Skills } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  quiet_methods(ns, ["disableLog", "sleep", "singularity.upgradeHomeRam"]);

  let loop_count = 0;
  const commiting_crimes = [false, false, false, false];
  const sleeve_timing = 30;
  const sleeve_thresholds = { "shock": 85, "combat": 90 }

  const combat_skills = [ns.enums.GymType.strength, ns.enums.GymType.dexterity, ns.enums.GymType.defense, ns.enums.GymType.agility];
  do {
    if (ns.sleeve.getNumSleeves() > 0 && loop_count % sleeve_timing == 0) {
      for (let sleeve_index = 0; sleeve_index < ns.sleeve.getNumSleeves(); sleeve_index++) {
        const sleeve = ns.sleeve.getSleeve(sleeve_index);
        if (sleeve.shock >= sleeve_thresholds.shock) {
          ns.sleeve.setToShockRecovery(sleeve_index);
        } else if (get_sleeve_combat_average(sleeve.skills) < (sleeve_thresholds.combat * ns.getBitNodeMultipliers().AgilityLevelMultiplier)) {
          const combat_choice = combat_skills[(loop_count / sleeve_timing) % 4];
          ns.sleeve.setToGymWorkout(sleeve_index, "Powerhouse Gym", combat_choice);
        } else if (!commiting_crimes[sleeve_index] && ns.heart.break() > -54000) {
          ns.sleeve.setToCommitCrime(sleeve_index, "Homicide");
          commiting_crimes[sleeve_index] = true;
        }
      }
    }

    await ns.sleep(1000)
    loop_count += 1;
  } while (true);
}

function get_sleeve_combat_average(skills: Skills) {
  return (skills.agility + skills.defense + skills.dexterity + skills.strength) / 4
}
