import { NS } from "@ns";
import { quiet_methods } from "library.js"

/** @param {NS} ns */
export async function main(ns: NS) {
  quiet_methods(ns, ["disableLog", "asleep", "gang.purchaseEquipment", "gang.setMemberTask"])

  //ns.gang.createGang("NiteSec");
  const name_pool = ["greg", "wilson", "kutner", "eugine schwarts", "thriteen", "masters", "cuddy", "foreman", "chase", "taub", "cameron", "sam", "amber", "adams", "bosley", "park"];
  const all_equipment_raw = [["Baseball Bat"], ["Katana"], ["Glock 18C"], ["P90C"], ["Steyr AUG"], ["AK-47"], ["M15A10 Assault Rifle"], ["AWM Sniper Rifle"], ["Bulletproof Vest"], ["Full Body Armor"], ["Liquid Body Armor"], ["Graphene Plating Armor"], ["Ford Flex V20"], ["ATX1070 Superbike"], ["Mercedes-Benz S9001"], ["White Ferrari"], ["NUKE Rootkit"], ["Soulstealer Rootkit"], ["Demon Rootkit"], ["Hmap Node"], ["Jack the Ripper"], ["Bionic Arms"], ["Bionic Legs"], ["Bionic Spine"], ["BrachiBlades"], ["Nanofiber Weave"], ["Synthetic Heart"], ["Synfibril Muscle"], ["BitWire"], ["Neuralstimulator"], ["DataJack"], ["Graphene Bone Lacings"]];
  const hack_equipment_raw = [["NUKE Rootkit"], ["Soulstealer Rootkit"], ["Demon Rootkit"], ["Hmap Node"], ["Jack the Ripper"], ["Bionic Arms"], ["Bionic Legs"], ["Bionic Spine"], ["BrachiBlades"], ["Nanofiber Weave"], ["Synthetic Heart"], ["Synfibril Muscle"], ["BitWire"], ["Neuralstimulator"], ["DataJack"], ["Graphene Bone Lacings"]];
  const combat_members = ["greg", "kutner", "amber"];
  const hack_task_wanted_levels = { "Cyberterrorism": 2, "Terrorism": 2, "Money Laundering": 1, "Human Trafficing": 1, "Ethical Hacking": -1, "Vigilante Justice": -1 }
  const ascension_threshold = 1.4;
  const equipment_cost_threshold = 64;
  const recruit_skill_threshold = 500;
  const hacking_training_threshold = 1500;
  const charisma_training_threshold = 50;
  const combat_training_threshold = 1500;
  const respect_threshold = 125000000;
  const action_loop_count = 60;
  const warfare_loop_count = 60;
  const warefare_power_threshold = 70;
  const clash_upper_bound = 0.65;
  const clash_lower_bound = 0.60;
  const clashing_cooldown_max = 300;
  const clashing_cooldown_print_incriment = 20;
  let my_gang_info;
  let gang_members;
  let wanted_gain_rate;
  let all_equipment, hack_equipment;
  let clashing_currently = false;
  let clashing_cooldown = 0;
  const actions = ["Cyberterrorism", "Money Laundering", "Ethical Hacking", "Train Hacking", "Train Charisma", "Terrorism",];
  //let tasks = ["Unassigned", "Ransomware", "Phishing", "Identity Theft", "DDoS Attacks", "Plant Virus", "Fraud & Counterfeiting", "Money Laundering", "Cyberterrorism", "Ethical Hacking", "Vigilante Justice", "Train Combat", "Train Hacking", "Train Charisma", "Territory Warfare"];
  let loop_count = -1;
  while (!ns.gang.inGang()) {
    await ns.asleep(10000);
  }

  const gang_type = JSON.parse(ns.read("json/gang_type.json"));

  ns.gang.setTerritoryWarfare(false);

  while (true) {
    loop_count += 1;
    gang_members = shuffle(ns.gang.getMemberNames());
    my_gang_info = ns.gang.getGangInformation();
    if (loop_count % action_loop_count == 0) {
      const action_counts = new Map();
      for (const action of actions) {
        action_counts.set(action, 0);
      }
      all_equipment = equipment_cost_formatter(ns, all_equipment_raw);
      hack_equipment = equipment_cost_formatter(ns, hack_equipment_raw);
      wanted_gain_rate = 0
      for (const member of gang_members) {
        const member_information = ns.gang.getMemberInformation(member);
        if (!combat_members.includes(member) || my_gang_info.territory == 1) {
          let selected_task = "";
          if (gang_type == "Hack") {
            const ascension_results = ns.gang.getAscensionResult(member);
            if (ascension_results) {
              if (ascension_results.hack >= ascension_threshold || ascension_results.cha >= ascension_threshold) {
                ns.gang.ascendMember(member);
                ns.printf("Ascended: %s", member);
              }
            }
            const bad_actions = ["Cyberterrorism", "Money Laundering"];
            let bad_action;

            if (respect_threshold > ns.gang.getGangInformation().respect) { // TODO: refactor to use faction rep
              bad_action = bad_actions[Math.floor(Math.random() * bad_actions.length)];
            } else {
              bad_action = "Money Laundering"
            }
            if (gang_members.length < 6 && member_information.hack > recruit_skill_threshold) {
              selected_task = "Cyberterrorism";
            } else if (member_information.hack < hacking_training_threshold) {
              selected_task = "Train Hacking";
            } else if (member_information.cha < charisma_training_threshold) {
              selected_task = "Cyberterrorism";
            } else if (ns.gang.getGangInformation().wantedPenalty > 5) {
              if (wanted_gain_rate >= 0) {
                selected_task = "Ethical Hacking";
              } else {
                selected_task = bad_action;
              }
            } else {
              selected_task = bad_action;
            }
          } else if (gang_type == "Combat") {
            const ascension_results = ns.gang.getAscensionResult(member);
            if (ascension_results) {
              if (ascension_results.agi >= ascension_threshold) {
                ns.gang.ascendMember(member);
                ns.printf("Ascended: %s", member);
              }
            }
            const bad_actions = ["Terrorism", "Human Trafficking"];
            let bad_action;

            if (respect_threshold > ns.gang.getGangInformation().respect) { // TODO: refactor to use faction rep
              bad_action = bad_actions[Math.floor(Math.random() * bad_actions.length)];
            } else {
              bad_action = "Human Trafficking"
            }
            if (gang_members.length < 6 && member_information.agi > recruit_skill_threshold) {
              selected_task = "Terrorism";
            } else if (member_information.agi < hacking_training_threshold) {
              selected_task = "Train Combat";
            } else if (member_information.cha < charisma_training_threshold) {
              selected_task = "Terrorism";
            } else if (ns.gang.getGangInformation().wantedPenalty > 5) {
              if (wanted_gain_rate >= 0) {
                selected_task = "Vigilante Justice";
              } else {
                selected_task = bad_action;
              }
            } else {
              selected_task = bad_action;
            }
          }

          ns.gang.setMemberTask(member, selected_task);
          wanted_gain_rate += hack_task_wanted_levels[selected_task];
          action_counts.set(selected_task, action_counts.get(selected_task) + 1);

          if (member_information.hack >= hacking_training_threshold * 3 && member_information.cha >= charisma_training_threshold * 1.2) {
            const bought_equipment = [];
            for (const equipment of hack_equipment) {
              if (equipment.cost * equipment_cost_threshold <= ns.getPlayer().money) {
                if (ns.gang.purchaseEquipment(member, equipment.name)) {
                  bought_equipment.push(equipment.name)
                  //ns.tprintf("Bought %s for %s", equipment.name, member);
                }
              }
            }
            if (bought_equipment.length > 0) {
              ns.printf("Bought %s for %s", bought_equipment.join(", "), member);
            }
          }
        } else {
          const ascension_results = ns.gang.getAscensionResult(member);
          if (ascension_results) {
            if (ascension_results.str >= ascension_threshold) {
              ns.gang.ascendMember(member);
              ns.printf("Ascended: %s", member);
            }
          }
          let selected_task = "";
          if (member_information.str < combat_training_threshold) {
            selected_task = "Train Combat";
          } else {
            selected_task = "Territory Warfare";
          }
          ns.gang.setMemberTask(member, selected_task);

          if (member_information.str >= combat_training_threshold * 1.2) {
            const bought_equipment = [];
            for (const equipment of all_equipment) {
              if (equipment.cost * equipment_cost_threshold <= ns.getPlayer().money) {
                if (ns.gang.purchaseEquipment(member, equipment.name)) {
                  bought_equipment.push(equipment.name)
                  //ns.tprintf("Bought %s for %s", equipment[0], member);
                }
              }
            }
            if (bought_equipment.length > 0) {
              ns.printf("Bought %s for %s", bought_equipment.join(", "), member);
            }
          }
        }
      }
      const seperator = (loop_count / action_loop_count).toString().padStart(5, "0") + "-".repeat(25);
      ns.printf("%s", seperator);
      for (const action of actions) {
        ns.printf("%s: %i", action, action_counts.get(action));
      }
    }

    if (loop_count % warfare_loop_count == 0) {
      const gang_names = ["Speakers for the Dead", "The Black Hand", "Slum Snakes", "Tetrads", "The Syndicate", "The Dark Army", "NiteSec"]
      let worst_clash_chance = 1.0;
      let average_clash_chance = 0.0;
      const average_clash_chance_list = [];
      for (const check_gang of gang_names) {
        if (ns.gang.getOtherGangInformation()[check_gang].territory == 0.0) { continue }
        const current_chance = ns.gang.getChanceToWinClash(check_gang);
        if (current_chance == 0.5) { continue }
        worst_clash_chance = Math.min(current_chance, worst_clash_chance);
        average_clash_chance_list.push(current_chance);
      }
      if (average_clash_chance_list.length > 0) {
        average_clash_chance = average_clash_chance_list.reduce((a, b) => a + b) / average_clash_chance_list.length
      }
      const clash_print_bound = clashing_currently ? clash_lower_bound : clash_upper_bound;
      if (average_clash_chance != 0) {
        ns.printf("Average clash chance: %s of %s", ns.format.number(average_clash_chance, 2), ns.format.number(clash_print_bound, 2))
      }
      if (clashing_currently && average_clash_chance <= clash_lower_bound) {
        ns.tprintf("%b %b %b", clashing_currently, (my_gang_info.power <= warefare_power_threshold), (average_clash_chance <= clash_lower_bound));
        ns.gang.setTerritoryWarfare(false)
        clashing_currently = false;
        clashing_cooldown = clashing_cooldown_max;
        ns.tprintf("Stopping gang warfare")
        ns.printf("Stopping gang warfare")
      } else if (clashing_currently == false && average_clash_chance >= clash_upper_bound && clashing_cooldown == 0) {
        ns.gang.setTerritoryWarfare(true)
        clashing_currently = true;
        ns.tprintf("Starting gang warfare")
        ns.printf("Starting gang warfare")
      }
      clashing_cooldown = Math.max(0, clashing_cooldown - 1);
      if (clashing_cooldown % clashing_cooldown_print_incriment) {
        ns.printf("Clash on cooldown: %s/%s", clashing_cooldown % clashing_cooldown_print_incriment, clashing_cooldown_max / clashing_cooldown_print_incriment);
      }
    }

    if (ns.gang.canRecruitMember()) {
      const new_name = name_pool[gang_members.length];
      ns.gang.recruitMember(new_name);
      ns.tprintf("Recuited: %s", new_name);
      ns.gang.setMemberTask(new_name, "Train Hacking");
    }
    if (ns.gang.getBonusTime() > 0) {
      await ns.asleep(20);
    } else {
      await ns.asleep(500);
    }
  }
}

function shuffle(array: string[]) {
  // Sourced from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

function equipment_cost_formatter(ns: NS, equipment_list: string[][]) {
  const return_list = [];
  for (const equipment of equipment_list) {
    return_list.push({ name: equipment[0], cost: ns.gang.getEquipmentCost(equipment[0]) })
  }
  return return_list
}
