import { NS } from "@ns";
import { quiet_methods } from "library.js"

/** @param {NS} ns */
export async function main(ns: NS) {
  quiet_methods(ns, ["disableLog", "singularity.getOwnedAugmentations", "singularity.purchaseAugmentation", "singularity.getAugmentationBasePrice"]);
  /**let all_servers = get_servers(ns, "home", []);
  ns.tprint(all_servers);
  for (let target_server of all_servers) {
    ns.tprintRaw(ns.ps(target_server)[0].args);
  }*/

  //ns.ui.openTail();
  const user_augments = ns.singularity.getOwnedAugmentations();
  const output_list = [];
  for (const augment of user_augments) {
    const price = ns.singularity.getAugmentationBasePrice(augment);
    const element = { name: augment, price: price };
    output_list.push(element);
  }
  output_list.sort((a, b) => { return a.price < b.price });
  for (const augment of output_list) {
    ns.printf("\"%s\": %s", augment.name, augment.price);
  }

  const augment_costs = { "Neurotrainer I": 4000000, "Synaptic Enhancement Implant": 7500000, "BitWire": 10000000, "Speech Enhancement": 12500000, "ADR-V1 Pheromone Gene": 17500000, "Neurotrainer II": 45000000, "Speech Processor Implant": 50000000, "Cranial Signal Processors - Gen I": 70000000, "Artificial Synaptic Potentiation": 80000000, "CashRoot Starter Kit": 125000000, "Cranial Signal Processors - Gen II": 125000000, "Neurotrainer III": 130000000, "Power Recirculation Core": 180000000, "CRTX42-AA Gene Modification": 225000000, "Embedded Netburner Module": 250000000, "Neural-Retention Enhancement": 250000000, "DataJack": 450000000, "Cranial Signal Processors - Gen III": 550000000, "FocusWire": 900000000, "Cranial Signal Processors - Gen IV": 1100000000, "Enhanced Myelin Sheathing": 1375000000, "Neural Accelerator": 1750000000, "PCMatrix": 2000000000, "Embedded Netburner Module Core Implant": 2500000000, "HyperSight Corneal Implant": 2750000000, "Artificial Bio-neural Network Implant": 3000000000, "Neuralstimulator": 3000000000, "PC Direct-Neural Interface": 3750000000, "Xanipher": 4250000000, "BitRunners Neurolink": 4375000000, "Embedded Netburner Module Core V2 Upgrade": 4500000000, "PC Direct-Neural Interface Optimization Submodule": 4500000000, "SPTN-97 Gene Modification": 4875000000, "Embedded Netburner Module Analyze Engine": 6000000000, "Embedded Netburner Module Direct Memory Access Upgrade": 7000000000, "Embedded Netburner Module Core V3 Upgrade": 7500000000 };
  const augments = ["Embedded Netburner Module Core V3 Upgrade", "PC Direct-Neural Interface NeuroNet Injector", "Embedded Netburner Module Direct Memory Access Upgrade", "Embedded Netburner Module Analyze Engine", "Unstable Circadian Modulator", "SPTN-97 Gene Modification", "PC Direct-Neural Interface Optimization Submodule", "Embedded Netburner Module Core V2 Upgrade", "BitRunners Neurolink", "Xanipher", "PC Direct-Neural Interface", "Neuralstimulator", "Artificial Bio-neural Network Implant", "HyperSight Corneal Implant", "SmartJaw", "Embedded Netburner Module Core Implant", "Cranial Signal Processors - Gen V", "PCMatrix", "Neural Accelerator", "Enhanced Myelin Sheathing", "Enhanced Social Interaction Implant", "Cranial Signal Processors - Gen IV", "FocusWire", "Cranial Signal Processors - Gen III", "The Black Hand", "Neuroreceptor Management Implant", "ADR-V2 Pheromone Gene", "DataJack", "The Shadow's Simulacrum", "Neuregen Gene Modification", "Neural-Retention Enhancement", "Embedded Netburner Module", "CRTX42-AA Gene Modification", "TITN-41 Gene-Modification Injection", "Power Recirculation Core", "Neurotrainer III", "Cranial Signal Processors - Gen II", "CashRoot Starter Kit", "Artificial Synaptic Potentiation", "Cranial Signal Processors - Gen I", "Speech Processor Implant", "Neurotrainer II", "Nuoptimal Nootropic Injector Implant", "ADR-V1 Pheromone Gene", "Speech Enhancement", "BitWire", "Synaptic Enhancement Implant", "Neurotrainer I", "The Red Pill"];
  const factions = ["NiteSec", "CyberSec", "BitRunners", "The Black Hand", "Daedalus"];

  const extra_augments = [];
  for (const augment of user_augments) {
    if (!(augments.includes(augment) || augment == "NeuroFlux Governor")) {
      extra_augments.push(augment);
    }
  }
  const print_list = [].concat(augments).concat(extra_augments);
  print_list.sort((a, b) => { return ns.singularity.getAugmentationBasePrice(a) < ns.singularity.getAugmentationBasePrice(b) });
  if (extra_augments.length > 0) {
    ns.tprintf("Augment list missing: %s", extra_augments.join(", "));
    ns.printf("[\"%s\"]", print_list.join("\", \""))
  }


  for (const faction of factions) {
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
}

/** @param {NS} ns */
function get_servers(ns, server, current_server_list) {
  current_server_list.push(server);
  const adjacent_servers = ns.scan(server);
  for (const server_to_check of adjacent_servers) {
    if (!current_server_list.includes(server_to_check)) {
      get_servers(ns, server_to_check, current_server_list);
    }
  }
  return current_server_list;
}
