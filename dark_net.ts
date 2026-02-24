import { NS, ServerAuthDetails } from "@ns";

const password_solvers = {
  "DeskMemo_3.1": desk_memo,
  "CloudBlare(tm)": cloud_blare,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  "ZeroLogon": (_: ServerAuthDetails) => { return [""]; },
};

export async function main(ns: NS) {

  const debug_printing = true;
  const solver_models = Object.keys(password_solvers);
  const missing_solvers: string[] = [];
  const printed_missing_solvers: string[] = [];

  const files = ns.ls(ns.getHostname());
  for (const file in files) {
    if (/cache/.test(file)) {
      ns.tprintf("%s", file);
      ns.dnet.openCache(file);
    }
  }

  while (true) {
    const nearby_servers = ns.dnet.probe();

    for (const dark_net_server of nearby_servers) {
      const details = ns.dnet.getServerAuthDetails(dark_net_server);
      if (!details.isConnectedToCurrentServer || !details.isOnline) {
        continue;
      }

      if (!solver_models.includes(details.modelId)) {
        if (!missing_solvers.includes(details.modelId) && !printed_missing_solvers.includes(details.modelId)) {
          missing_solvers.push(details.modelId);
          continue;
        }
      }

      // ns.tprintf("%s: %i", dark_net_server.slice(0, 15).padEnd(15, " "), ns.getServer(dark_net_server).ramUsed);

      if (ns.dnet.isDarknetServer()) {
        if (ns.getServer(dark_net_server).ramUsed - ns.dnet.getBlockedRam() > 0) {
          continue;
        }
      }

      const solver = password_solvers[details.modelId as keyof typeof password_solvers];

      if (solver) {
        const password_attempts = solver(details);
        let successful = false;
        for (const password_atempt of password_attempts) {
          if (debug_printing) ns.tprintf("%s", details.modelId);
          try {
            const attempt_result = await ns.dnet.authenticate(dark_net_server, password_atempt as string);
            if (attempt_result.success) {
              successful = true;
              break;
            } else {
              console.log(attempt_result);
            }
          } catch (error) {
            ns.tprintf("%s %s: %s", dark_net_server, details.modelId, password_atempt);
          }
        }
        if (successful) {
          ns.scp("dark_net.js", dark_net_server);
          await ns.dnet.memoryReallocation(dark_net_server);
          ns.exec("dark_net.js", dark_net_server);
          //ns.tprintf("running on %s now", dark_net_server);
        } else {
          ns.tprintf("solver for %s was unsuccessful on %s, %s, %s", details.modelId, dark_net_server, details.passwordHint, details.passwordLength);
        }
      }

    }
    ns.tprintf("%s", missing_solvers.join());
    missing_solvers.map((solver) => { printed_missing_solvers.push(solver); });
    missing_solvers.length = 0; // empty the array
    await ns.asleep(5_000);
  }
}

function desk_memo(auth_details: ServerAuthDetails) {
  const re = new RegExp(`\\d${auth_details.passwordLength}`);
  return [auth_details.passwordHint.match(re)];
}

function cloud_blare(auth_details: ServerAuthDetails) {
  const numbers = auth_details.data.match(/\d+/g);
  if (numbers) {
    return [numbers.join("")];
  }
  throw "missing numbers in data";
}
