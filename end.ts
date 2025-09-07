import { NS } from "@ns";
import { quiet_methods } from "library.js"

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
  output_list.sort((a, b) => { return b.price - a.price });
  for (const augment of output_list) {
    ns.printf("\"%s\": %s", augment.name, augment.price);
  }

  const augments = ["Embedded Netburner Module Core V3 Upgrade", "PC Direct-Neural Interface NeuroNet Injector", "Embedded Netburner Module Direct Memory Access Upgrade", "Embedded Netburner Module Analyze Engine", "Unstable Circadian Modulator", "SPTN-97 Gene Modification", "PC Direct-Neural Interface Optimization Submodule", "Embedded Netburner Module Core V2 Upgrade", "BitRunners Neurolink", "Xanipher", "PC Direct-Neural Interface", "Neuralstimulator", "Artificial Bio-neural Network Implant", "HyperSight Corneal Implant", "SmartJaw", "Embedded Netburner Module Core Implant", "Cranial Signal Processors - Gen V", "PCMatrix", "Neural Accelerator", "Enhanced Myelin Sheathing", "Enhanced Social Interaction Implant", "Cranial Signal Processors - Gen IV", "FocusWire", "Cranial Signal Processors - Gen III", "The Black Hand", "Neuroreceptor Management Implant", "ADR-V2 Pheromone Gene", "DataJack", "The Shadow's Simulacrum", "Neuregen Gene Modification", "Neural-Retention Enhancement", "Embedded Netburner Module", "CRTX42-AA Gene Modification", "TITN-41 Gene-Modification Injection", "Power Recirculation Core", "Neurotrainer III", "Cranial Signal Processors - Gen II", "CashRoot Starter Kit", "Artificial Synaptic Potentiation", "Cranial Signal Processors - Gen I", "Speech Processor Implant", "Neurotrainer II", "Nuoptimal Nootropic Injector Implant", "ADR-V1 Pheromone Gene", "Speech Enhancement", "BitWire", "Synaptic Enhancement Implant", "Neurotrainer I", "The Red Pill"];
  const factions = ["NiteSec", "CyberSec", "BitRunners", "The Black Hand", "Daedalus"];

  const extra_augments = [];
  for (const augment of user_augments) {
    if (!(augments.includes(augment) || augment == "NeuroFlux Governor")) {
      extra_augments.push(augment);
    }
  }
  const print_list = augments.concat(extra_augments);
  print_list.sort((a, b) => { return ns.singularity.getAugmentationBasePrice(a) - ns.singularity.getAugmentationBasePrice(b) });
  if (extra_augments.length > 0) {
    ns.tprintf("Augment list missing: %s", extra_augments.join(", "));
    ns.printf("[\"%s\"]", print_list.join("\", \""))
  }

  const all_factions = [ns.gang.getGangInformation().faction].concat(factions);

  for (const faction of all_factions) {
    for (let i = 0; i < 4; i++) {
      for (const augment of augments) {
        if (ns.singularity.purchaseAugmentation(faction, augment)) {
          ns.tprintf("%s: %s,", ns.singularity.getAugmentationBasePrice(augment), augment);
        }
      }
      let governor_bought;
      do {
        const governor_name = "NeuroFlux Governor";
        governor_bought = ns.singularity.purchaseAugmentation(faction, governor_name);
      } while (governor_bought)
    }
  }
  ns.singularity.installAugmentations("callback.js")
}
