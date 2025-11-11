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
  const combat_augments: string[] = [];
  const hacking_augments: string[] = [];
  const other_augments: string[] = [];
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
    if (combat_bonus > 4) {
      for (const prerequisite_augment of augment_prerequisites) {
        if (!combat_augments.includes(prerequisite_augment)) combat_augments.push(prerequisite_augment);
      }
      if (!combat_augments.includes(augment.name)) combat_augments.push(augment.name);
    }
    if (augment.stats.hacking > 1) {
      for (const prerequisite_augment of augment_prerequisites) {
        if (!hacking_augments.includes(prerequisite_augment)) hacking_augments.push(prerequisite_augment);
      }
      if (!hacking_augments.includes(augment.name)) hacking_augments.push(augment.name);
    }
    const other_stats = augment.stats.strength_exp + augment.stats.defense_exp + augment.stats.dexterity_exp + augment.stats.agility_exp + augment.stats.charisma + augment.stats.charisma_exp + augment.stats.hacking_exp + augment.stats.bladeburner_success_chance;
    if (other_stats > 8) {
      for (const prerequisite_augment of augment_prerequisites) {
        if (!other_augments.includes(prerequisite_augment)) other_augments.push(prerequisite_augment);
      }
      if (!other_augments.includes(augment.name)) other_augments.push(augment.name);
    }
  }
  ns.printf("%s", combat_augments.concat(hacking_augments, other_augments).join(", "));

  const augments = combat_augments.concat(hacking_augments, other_augments, ["Embedded Netburner Module Core V3 Upgrade", "PC Direct-Neural Interface NeuroNet Injector", "Embedded Netburner Module Direct Memory Access Upgrade", "Embedded Netburner Module Analyze Engine", "Unstable Circadian Modulator", "SPTN-97 Gene Modification", "PC Direct-Neural Interface Optimization Submodule", "Embedded Netburner Module Core V2 Upgrade", "BitRunners Neurolink", "Xanipher", "PC Direct-Neural Interface", "Neuralstimulator", "Artificial Bio-neural Network Implant", "HyperSight Corneal Implant", "SmartJaw", "Embedded Netburner Module Core Implant", "Cranial Signal Processors - Gen V", "PCMatrix", "Neural Accelerator", "Enhanced Myelin Sheathing", "Enhanced Social Interaction Implant", "Cranial Signal Processors - Gen IV", "FocusWire", "Cranial Signal Processors - Gen III", "The Black Hand", "Neuroreceptor Management Implant", "ADR-V2 Pheromone Gene", "DataJack", "The Shadow's Simulacrum", "Neuregen Gene Modification", "Neural-Retention Enhancement", "Embedded Netburner Module", "CRTX42-AA Gene Modification", "TITN-41 Gene-Modification Injection", "Power Recirculation Core", "Neurotrainer III", "Cranial Signal Processors - Gen II", "CashRoot Starter Kit", "Artificial Synaptic Potentiation", "Cranial Signal Processors - Gen I", "Speech Processor Implant", "Neurotrainer II", "Nuoptimal Nootropic Injector Implant", "ADR-V1 Pheromone Gene", "Speech Enhancement", "BitWire", "Synaptic Enhancement Implant", "Neurotrainer I", "The Red Pill"]);
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
