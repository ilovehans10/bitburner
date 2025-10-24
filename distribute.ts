import { get_hacked_servers, get_best_target, backdoor_server } from "library.js";
import { NS, FactionName } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
  const methods_to_quiet = ["ALL"];
  for (const method_to_quiet of methods_to_quiet) {
    ns.disableLog(method_to_quiet);
  }

  const kill_old_scripts = ns.args[0];
  const keep_alive = ns.args[1];
  const blacklist = ["home"];
  let loop_count = 0;
  let new_servers = [];
  let changed_servers = [];
  const server_objects: { name: string, path_home: string }[] = JSON.parse(ns.read("json/server_paths.json"));
  const faction_requirements = [{ "server": "CSEC", "faction": "CyberSec" }, { "server": "avmnite-02h", "faction": "NiteSec" }, { "server": "I.I.I.I", "faction": "The Black Hand" }, { "server": "run4theh111z", "faction": "BitRunners" }];
  if (server_objects.findIndex(p => p.name == "w0r1d_d43m0n") >= 0) {
    faction_requirements.push({ "server": "w0r1d_d43m0n", "faction": "" });
  }
  do {
    const suggested_target_server = get_best_target(ns) || "n00dles";
    const all_target_servers = get_hacked_servers(ns);
    //ns.print(all_target_servers);
    const scripts = ["self_hack.js"];
    for (const current_server of all_target_servers) {
      if (blacklist.includes(current_server)) {
        continue;
      }
      //ns.print(current_server);
      const ram = ns.getServerMaxRam(current_server);
      const script_ram = ns.getScriptRam(scripts[0]);
      const thread_count = Math.floor(ram / script_ram);

      let target_server;
      if (ns.getServerMaxMoney(current_server) > 0) {
        target_server = current_server;
      } else {
        target_server = suggested_target_server;
      }

      if (ns.ps(current_server).length >= 1 && (ns.ps(current_server)[0].args[0] != target_server || kill_old_scripts)) {
        const script_pid = ns.ps(current_server)[0].pid;
        ns.kill(script_pid);
        changed_servers.push(current_server);
      }

      ns.scp(scripts, current_server);
      if (ns.getServerUsedRam(current_server) < 1) {
        if (thread_count >= 1) {
          ns.exec(scripts[0], current_server, thread_count, target_server);
          ns.printf("selfhack now running on: %s, with %d, thread(s), pointed at %s.", current_server, thread_count, target_server);
          changed_servers.includes(current_server) ? null : new_servers.push(current_server);
        }
      }
    }

    ns.clearPort(1);
    ns.clearPort(2);
    ns.clearPort(3);
    ns.writePort(1, get_best_target(ns));
    ns.writePort(2, ns.getServerMinSecurityLevel(suggested_target_server));
    ns.writePort(3, ns.getServerMaxMoney(suggested_target_server));
    if (ns.heart.break() <= -54_000) {
      if (ns.peek(4) != "Gangs Ready") {
        ns.tprint("Heart Broken: Gangs are ready");
        ns.singularity.joinFaction("Slum Snakes");
      }
      ns.writePort(4, "Gangs Ready");
    }

    if (new_servers.some(a => faction_requirements.some(b => b.server == a))) {
      for (const server of new_servers.filter(a => faction_requirements.some(b => b.server == a))) {
        const server_requirements = faction_requirements.find(a => a.server == server);
        if (server_requirements == undefined) {
          ns.tprintf("Couldn't find server requirements for %j", server); return;
        }
        if (ns.hasRootAccess(server_requirements.server)) {
          await backdoor_server(ns, server_requirements.server);
          if (ns.singularity.joinFaction(server_requirements.faction as FactionName)) {
            ns.tprintf("Joined faction: %s", server_requirements.faction);
          }
        }
      }
    }

    if (loop_count % 10 == 0) {
      ns.printf("%s", (loop_count / 10).toString().padStart(5, "0").padEnd(30, "-"));
      ns.printf("Karma: %i", ns.heart.break());
      if (new_servers.length + changed_servers.length > 0) {
        ns.tprintf("%s", (loop_count / 10).toString().padStart(5, "0").padEnd(30, "-"));
        ns.tprintf("%s new servers running selfhack", new_servers.length);
        ns.tprintf("%s servers target changed to %s", changed_servers.length, get_best_target(ns));

        ns.printf("%s new servers running selfhack", new_servers.length);
        ns.printf("%s servers target changed to %s", changed_servers.length, suggested_target_server);
        new_servers = [];
        changed_servers = [];
      }
    }
    await ns.asleep(30_000);
    loop_count++;
  } while (keep_alive);
}
