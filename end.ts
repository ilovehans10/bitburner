import { NS, FactionName, Multipliers } from "@ns";
import { quiet_methods } from "library.js";

/** @param {NS} ns */
export async function main(ns: NS) {
  quiet_methods(ns, ["disableLog", "singularity.getOwnedAugmentations", "singularity.purchaseAugmentation", "singularity.getAugmentationBasePrice"]);

  const user_augments = ns.singularity.getOwnedAugmentations();
  const output_list = [];
  for (const augment of user_augments) {
    const price = ns.singularity.getAugmentationBasePrice(augment);
    const element = { name: augment, price: price };
    output_list.push(element);
  }
  output_list.sort((a, b) => { return b.price - a.price; });
  for (const augment of output_list) {
    ns.printf("\"%s\": %s", augment.name, augment.price);
  }

  const all_augments: { name: string, price: number, stats: Multipliers, factions: string[] }[] = [];
  const augment_stat_multipliers: { stat: keyof Multipliers, multiplier: number }[] = [];
  type augment_class = "combat" | "hacking" | "utility" | "other" | "filler";
  const augment_order: augment_class[] = ["combat", "hacking", "other"];
  type augment_aggregator_type = { [a in augment_class]: string[]; }
  const augment_aggregator: augment_aggregator_type = { combat: [], hacking: [], other: [], utility: [], filler: [] };
  for (const faction_key in ns.enums.FactionName) {
    const faction = ns.enums.FactionName[faction_key as keyof typeof ns.enums.FactionName];
    if (!ns.getPlayer().factions.includes(faction)) continue;
    const faction_augments = ns.singularity.getAugmentationsFromFaction(faction);
    for (let index = 0; index < faction_augments.length; index++) {
      const augment = faction_augments[index];
      const augment_index = all_augments.findIndex(a => a.name == augment);
      if (augment_index < 0) {
        all_augments.push({ name: augment, price: ns.singularity.getAugmentationBasePrice(augment), stats: ns.singularity.getAugmentationStats(augment), factions: [faction] });
      } else {
        all_augments[augment_index].factions.push(faction);
      }
    }
  }
  all_augments.sort((a, b) => { return b.price - a.price; });
  for (const augment of all_augments) {
    const augment_prerequisites = ns.singularity.getAugmentationPrereq(augment.name).sort((a, b) => { return ns.singularity.getAugmentationBasePrice(a) - ns.singularity.getAugmentationBasePrice(b); });
    const combat_bonus = augment.stats.strength + augment.stats.defense + augment.stats.dexterity + augment.stats.agility;
    const other_stats = augment.stats.strength_exp + augment.stats.defense_exp + augment.stats.dexterity_exp + augment.stats.agility_exp + augment.stats.charisma + augment.stats.charisma_exp + augment.stats.hacking_exp + augment.stats.bladeburner_success_chance;
    if (combat_bonus > 4) {
      for (const prerequisite_augment of augment_prerequisites) {
        if (!augment_aggregator.combat.includes(prerequisite_augment)) augment_aggregator.combat.push(prerequisite_augment);
      }
      if (!augment_aggregator.combat.includes(augment.name)) augment_aggregator.combat.push(augment.name);
    } else if (augment.stats.hacking > 1) {
      for (const prerequisite_augment of augment_prerequisites) {
        if (!augment_aggregator.hacking.includes(prerequisite_augment)) augment_aggregator.hacking.push(prerequisite_augment);
      }
      if (!augment_aggregator.hacking.includes(augment.name)) augment_aggregator.hacking.push(augment.name);
    }
    else if (other_stats > 8) {
      for (const prerequisite_augment of augment_prerequisites) {
        if (!augment_aggregator.other.includes(prerequisite_augment)) augment_aggregator.other.push(prerequisite_augment);
      }
      if (!augment_aggregator.other.includes(augment.name)) augment_aggregator.other.push(augment.name);
    }
  }
  ns.printf("%s", augment_aggregator.combat.concat(augment_aggregator.hacking, augment_aggregator.other).join(", "));

  const augments = augment_aggregator.combat.concat(augment_aggregator.hacking, augment_aggregator.other);
  const factions = ns.getPlayer().factions;

  const extra_augments = [];
  for (const augment of user_augments) {
    if (!(augments.includes(augment) || augment == "NeuroFlux Governor")) {
      extra_augments.push(augment);
    }
  }
  const print_list = augments.concat(extra_augments);
  print_list.sort((a, b) => { return ns.singularity.getAugmentationBasePrice(a) - ns.singularity.getAugmentationBasePrice(b); });
  if (extra_augments.length > 0) {
    ns.tprintf("Augment list missing: %s", extra_augments.join(", "));
    ns.printf("[\"%s\"]", print_list.join("\", \""));
  }

  const all_factions = [ns.gang.getGangInformation().faction].concat(factions);

  for (const augment of augments) {
    for (const faction of all_factions) {
      if (ns.singularity.purchaseAugmentation(faction as FactionName, augment)) {
        ns.tprintf("%s: %s,", ns.singularity.getAugmentationBasePrice(augment), augment);
      }
    }
  }
  for (const faction of all_factions) {
    let governor_bought;
    do {
      const governor_name = "NeuroFlux Governor";
      governor_bought = ns.singularity.purchaseAugmentation(faction as FactionName, governor_name);
    } while (governor_bought);
  }
  ns.singularity.installAugmentations("callback.js");
}
