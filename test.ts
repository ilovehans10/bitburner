import { NS } from "@ns";

const price_multiplier_threshold = 2;

/** @param {NS} ns */
export async function main(ns: NS) {
  const all_augments: { name: string, price: number, factions: string[] }[] = [];
  for (const faction in ns.enums.FactionName) {
    if (!ns.getPlayer().factions.includes(faction)) continue;
    const faction_augments = ns.singularity.getAugmentationsFromFaction(ns.enums.FactionName[faction as keyof typeof ns.enums.FactionName]);
    for (let index = 0; index < faction_augments.length; index++) {
      const augment = faction_augments[index];
      const augment_index = all_augments.findIndex(a => a.name == augment);
      if (augment_index < 0) {
        all_augments.push({ name: augment, price: ns.singularity.getAugmentationBasePrice(augment), factions: [faction] });
      } else {
        all_augments[augment_index].factions.push(faction);
      }
    }
  }
  //ns.tprintf("%j\n%j", all_augments, all_augments[0].price * price_multiplier_threshold < ns.getPlayer().money);
  const filtered_factions_augments = all_augments.filter(a => a.price * price_multiplier_threshold < ns.getPlayer().money);
  //ns.tprintf("%j", filtered_factions_augments);
  const test_augments = { price: get_augment_list_price(filtered_factions_augments), list: filtered_factions_augments };
  do {
    test_augments.list.pop();
    test_augments.price = get_augment_list_price(test_augments.list);
    ns.asleep(100);
  } while (test_augments.price > ns.getPlayer().money);
  ns.tprintf("buying %d augments for %d: %j", test_augments.list.length, test_augments.price, test_augments.list);
}

function get_augment_price(base_price: number, prior_augments: number) {
  return base_price * (1.9 ** prior_augments);
}

function get_augment_list_price(augments: { name: string, price: number }[]) {
  augments.sort((a, b) => b.price - a.price);
  let list_price = 0;
  for (let index = 0; index < augments.length; index++) {
    const augment = augments[index];
    list_price += get_augment_price(augment.price, index);
  }
  return list_price;
}
