import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  ns.disableLog("ALL");

  const target = ns.args[0].toString();
  const security_threshold = ns.getServerMinSecurityLevel(target) * 2;
  const money_threshold = ns.getServerMaxMoney(target) * 0.95;
  let weaken_count = 0;
  let grow_count = 0;
  let hack_count = 0;
  while (true) {
    const current_security = ns.getServerSecurityLevel(target);
    const current_money = ns.getServerMoneyAvailable(target);
    let total_action_count = (weaken_count + grow_count + hack_count);
    const seperator = total_action_count.toString().padStart(5, "0") + "-".repeat(25);
    ns.printf("%s\nSecurity is %s of %s\nMoney is $%s of $%s\n", seperator, ns.format.number(current_security), ns.format.number(security_threshold), ns.format.number(current_money), ns.format.number(money_threshold));
    if (current_security > security_threshold) {
      ns.printf("Decided to weaken");
      const weaken_ammount = await ns.weaken(target);
      ns.printf("Weakened by: %s", ns.format.number(weaken_ammount));
      weaken_count++;
    } else if (current_money < money_threshold) {
      ns.printf("Decided to grow");
      const grow_ammount = await ns.grow(target);
      ns.printf("Grew by: %s", ns.format.number(grow_ammount));
      grow_count++;
    } else {
      ns.printf("Decided to hack");
      const hack_ammount = await ns.hack(target);
      ns.printf("Hacked for: $%s", ns.format.number(hack_ammount));
      hack_count++;
    }
    total_action_count += 1;
    if (total_action_count % 10 == 0) {
      ns.printf("%s\nWeaken: %i (%s)\nGrow: %i (%s)\nHack: %i (%s)", "-".repeat(30), weaken_count, ns.format.percent(weaken_count / total_action_count), grow_count, ns.format.percent(grow_count / total_action_count), hack_count, ns.format.percent(hack_count / total_action_count));
    }
  }
}
