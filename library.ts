import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  quiet_methods(ns, ["scan"]);
  const already_scanned: string[] = [];
  const server_list = [{ "name": "home", "path_home": "" }];
  const found_servers = ["home"];
  do {
    for (const item_to_scan of found_servers) {
      if (!already_scanned.includes(item_to_scan)) {
        const scan_result = ns.scan(item_to_scan);
        already_scanned.push(item_to_scan);
        for (const new_item of scan_result) {
          if (!found_servers.includes(new_item)) {
            server_list.push({ "name": new_item, "path_home": item_to_scan })
            found_servers.push(new_item);
          }
        }
      }
    }
  } while (already_scanned.length < found_servers.length)
}


/** @param {NS} ns */
export function make_network_map(ns: NS) {
  ns.write("network_map.txt", "flowchart TD\n", "w")
  const servers = get_servers(ns);
  for (const server in servers) {
    // ns.tprintf("id%s[%s]", server, servers[server])
    const id_name = "id" + server + "[" + servers[server] + "]\n"
    ns.write("network_map.txt", id_name, "a")
    for (const scanned_server of ns.scan(servers[server])) {
      if (servers.indexOf(scanned_server) > server) {
        const server_name = "id" + server + " --- id" + servers.indexOf(scanned_server) + "\n";
        ns.write("network_map.txt", server_name, "a")
        //ns.tprintf("id%s --- id%s", server, servers.indexOf(scanned_server));
      }
    }
  }
}

/** @param {NS} ns */
export function get_best_target(ns: NS) {
  quiet_methods(ns, ["disableLog", "getHackingLevel", "getServerRequiredHackingLevel", "getServerMaxMoney", "getServerMinSecurityLevel"]);

  const level_threshold = Math.max((ns.getHackingLevel() / 5), 1);
  let best_server = { name: "", score: 0 };
  for (const current_server of get_servers(ns)) {
    if (ns.getServerRequiredHackingLevel(current_server) > level_threshold || !ns.hasRootAccess(current_server)) {
      continue
    }
    const current_server_money = ns.getServerMaxMoney(current_server);
    const current_server_security = ns.getServerMinSecurityLevel(current_server);
    const current_server_score = current_server_money / current_server_security;
    //ns.printf("Server %s has a score of %s", current_server, ns.formatNumber(current_server_score));
    if (current_server_score > best_server.score) {
      best_server = { name: current_server, score: current_server_score };
    }
  }
  //ns.printf("The best server is %s with a score of %s", best_server[0], ns.formatNumber(best_server[1]));
  const return_value = best_server.name;
  return return_value;
}

/** @param {NS} ns */
export function get_servers(ns: NS) {
  quiet_methods(ns, ["scan"]);
  const already_scanned: string[] = [];
  const output_list = ["home"];
  do {
    for (const item_to_scan of output_list) {
      if (!already_scanned.includes(item_to_scan)) {
        const scan_result = ns.scan(item_to_scan);
        already_scanned.push(item_to_scan);
        for (const new_item of scan_result) {
          if (!output_list.includes(new_item)) {
            output_list.push(new_item);
          }
        }
      }
    }
  } while (already_scanned.length < output_list.length)
  return output_list;
}

/** @param {NS} ns */
export function get_hacked_servers(ns: NS) {
  quiet_methods(ns, ["disableLog", "getHackingLevel", "getServerRequiredHackingLevel", "getServerNumPortsRequired"]);

  const servers_to_check = get_servers(ns);
  let port_tool_count = 0;
  if (ns.fileExists("relaySMTP.exe")) {
    port_tool_count++;
  }
  if (ns.fileExists("HTTPWorm.exe")) {
    port_tool_count++;
  }
  if (ns.fileExists("SQLInject.exe")) {
    port_tool_count++;
  }
  if (ns.fileExists("FTPCrack.exe")) {
    port_tool_count++;
  }
  if (ns.fileExists("BruteSSH.exe")) {
    port_tool_count++;
  }
  const return_servers: string[] = [];
  for (const cannidate_server of servers_to_check) {
    const hacking_level_high_enough = ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(cannidate_server);
    const enough_ports_hackable = ns.getServerNumPortsRequired(cannidate_server) <= port_tool_count;
    if (hacking_level_high_enough && enough_ports_hackable) {
      if (!ns.hasRootAccess(cannidate_server)) {
        if (ns.fileExists("relaySMTP.exe")) {
          ns.relaysmtp(cannidate_server);
        }
        if (ns.fileExists("HTTPWorm.exe")) {
          ns.httpworm(cannidate_server);
        }
        if (ns.fileExists("SQLInject.exe")) {
          ns.sqlinject(cannidate_server);
        }
        if (ns.fileExists("FTPCrack.exe")) {
          ns.ftpcrack(cannidate_server);
        }
        if (ns.fileExists("BruteSSH.exe")) {
          ns.brutessh(cannidate_server);
        }
        ns.nuke(cannidate_server);
      }
      return_servers.push(cannidate_server);
    }
  }
  return return_servers;
}

export function quiet_methods(ns: NS, methods_to_quiet: string[] = []) {
  for (const method_to_quiet of methods_to_quiet) {
    ns.disableLog(method_to_quiet);
  }
}
