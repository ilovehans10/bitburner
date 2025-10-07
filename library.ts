import { NS } from "@ns";

/**
 * Creates a file that holds all server names
 * @param {NS} ns - netscript function object
 */
export async function main(ns: NS) {
  ns.tprintf("Library is empty");
}

/**
 * meant to be run after augmentations are installed
 * @param {NS} ns - netscript function object
 */
export function start_functions(ns: NS) {
  make_server_file(ns);
  make_network_map(ns);
  make_path_file(ns);
}

/**
 * Joins all factions
 * @param {NS} ns - netscript function object
 * @returns - returns a number indicating the current number of factions joined
 */
export async function faction_joiner(ns: NS) {
  const server_objects: { "name": string, "path_home": string }[] = JSON.parse(ns.read("json/server_paths.json"));
  const faction_requirements = [{ "server": "CSEC", "faction": "CyberSec" }, { "server": "avmnite-02h", "faction": "NiteSec" }, { "server": "I.I.I.I", "faction": "The Black Hand" }, { "server": "run4theh111z", "faction": "BitRunners" }];
  if (server_objects.findIndex(p => p.name == "w0r1d_d43m0n") >= 0) {
    faction_requirements.push({ "server": "w0r1d_d43m0n", "faction": "" });
  }
  let faction_joined_count = 0;
  for (const faction of faction_requirements) {
    if (ns.hasRootAccess(faction.server)) {
      await backdoor_server(ns, faction.server);
      if (ns.singularity.joinFaction(faction.faction)) {
        faction_joined_count += 1;
      }
    }
  }
  return faction_joined_count;
}

/**
 * Creates a file that holds information on how to recursively get back home from a server
 * @param {NS} ns - netscript function object
 */
function make_path_file(ns: NS) {
  const already_scanned: string[] = [];
  const server_objects = [{ "name": "home", "path_home": "" }];
  const found_servers = ["home"];
  do {
    for (const item_to_scan of found_servers) {
      if (!already_scanned.includes(item_to_scan)) {
        const scan_result = ns.scan(item_to_scan);
        already_scanned.push(item_to_scan);
        for (const new_item of scan_result) {
          if (!found_servers.includes(new_item)) {
            server_objects.push({ "name": new_item, "path_home": item_to_scan });
            found_servers.push(new_item);
          }
        }
      }
    }
  } while (already_scanned.length < found_servers.length);
  ns.write("json/server_paths.json", JSON.stringify(server_objects), "w");
}

/**
 * Creates a file that holds all server names
 * @param {NS} ns - netscript function object
 */
function make_server_file(ns: NS) {
  quiet_methods(ns, ["scan"]);
  const already_scanned: string[] = [];
  const output_list = ["home"];
  do {
    for (const item_to_scan of output_list) {
      if (!already_scanned.includes(item_to_scan)) {
        const scan_result = ns.scan(item_to_scan);
        already_scanned.push(item_to_scan);
        for (const new_item of scan_result) {
          if (!output_list.includes(new_item) && !new_item.startsWith("hacknet-server")) {
            output_list.push(new_item);
          }
        }
      }
    }
  } while (already_scanned.length < output_list.length);
  ns.write("json/server_names.json", JSON.stringify(output_list), "w");
}

/**
 * Finds and Returns a path from the server passed to it back to home
 * @param {{"name": string, "path_home": string}[]} server_fragments - a list of server fragments that will be used to find the path home
 * @returns a list of strings that leads from the server back to home
 */
function find_path(server_fragments: { "name": string, "path_home": string }[], target: string): string[] {
  const path = [target];
  while (path.at(-1) != "home") {
    //findIndex implmentation from https://stackoverflow.com/questions/11258077/how-to-find-index-of-an-object-by-key-and-value-in-an-javascript-array
    const next_server = server_fragments[server_fragments.findIndex(p => p.name == path.at(-1))].path_home;
    path.push(next_server);
  }
  return path;
}

export async function backdoor_server(ns: NS, target: string) {
  connect_to_server(ns, target);
  await ns.singularity.installBackdoor();
  ns.singularity.connect("home");
}

export async function connect_to_server(ns: NS, target: string) {
  const server_fragments: { "name": string, "path_home": string }[] = JSON.parse(ns.read("json/server_paths.json"));
  const path = find_path(server_fragments, target);
  for (const server_hop of path.reverse()) {
    ns.singularity.connect(server_hop);
  }
}

/**
 * Creates a file that holds a network map that can be viewed with mermaid.live
 * @param {NS} ns - netscript function object
 */
export function make_network_map(ns: NS) {
  ns.write("network_map.txt", "flowchart TD;", "w");
  const servers = get_servers(ns);
  for (const server in servers) {
    console.log(server);
    // ns.tprintf("id%s[%s]", server, servers[server])
    const id_name = "id" + server + "[" + servers[server] + "<br>" + ns.getServerRequiredHackingLevel(servers[server]) + "];";
    ns.write("network_map.txt", id_name, "a");
    for (const scanned_server of ns.scan(servers[server])) {
      if (servers.indexOf(scanned_server) > server) {
        const server_name = "id" + server + " --- id" + servers.indexOf(scanned_server) + ";";
        ns.write("network_map.txt", server_name, "a");
        //ns.tprintf("id%s --- id%s", server, servers.indexOf(scanned_server));
      }
    }
  }
}

/**
 * Returns the best target to hack
 * @param {NS} ns - netscript function object
 * @returns name of the best server to hack
 */
export function get_best_target(ns: NS) {
  quiet_methods(ns, ["disableLog", "getHackingLevel", "getServerRequiredHackingLevel", "getServerMaxMoney", "getServerMinSecurityLevel"]);

  const level_threshold = Math.max((ns.getHackingLevel() / 5), 1);
  let best_server = { name: "", score: 0 };
  for (const current_server of get_servers(ns)) {
    if (ns.getServerRequiredHackingLevel(current_server) > level_threshold || !ns.hasRootAccess(current_server)) {
      continue;
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

/**
 * returns all server names
 * @param {NS} ns - netscript function object
 * @returns returns a list of all server names
 */
export function get_servers(ns: NS): string[] {
  return JSON.parse(ns.read("json/server_names.json"));
}

/**
 * This function first hacks all hackable servers and then returns a list of servers that have been hacked
 * @param {NS} ns - netscript function object
 * @returns a list of names of servers that are currently hacked
 */
export function get_hacked_servers(ns: NS): string[] {
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
    if (ns.hasRootAccess(cannidate_server)) {
      return_servers.push(cannidate_server);
      continue;
    }
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
