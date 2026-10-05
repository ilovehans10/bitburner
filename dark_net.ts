import { NS, DarknetServerDetails } from "@ns";

const password_solvers = {
  "110100100": null,
  "AccountsManager_4.2": null, // given a number range and guess all numbers in that range
  "BellaCuore": null, // the data is a string represending a number in romal numerials: CDLXXVIII
  "CloudBlare(tm)": cloud_blare,
  "DeepGreen": null,
  "DeskMemo_3.1": desk_memo,
  "Factori-Os": null, // Guess numbers of a certain length
  "FreshInstall_1.0": fresh_install,
  "KingOfTheHill": null,
  "Laika4": null,
  "NIL": null,
  "OctantVoxel": null, // the hint is: the password is the base 7 number 1030 in base 10 and the data is 7,1030
  "OpenWebAccessPoint": null,
  "PHP 5.4": null, // data is digits that should be used in each permutation
  "Pr0verFl0": overflow, // the password buffer is a certain size and you have to overflow it with the same password as you entered
  "PrimeTime 2": null, // return the largest prime factor of a number
  "RateMyPix.Auth": null,
  "(The Labyrinth)": null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  "ZeroLogon": () => { return [""]; },
};

export async function main(ns: NS) {

  const debug_printing = false;
  const solver_models = Object.keys(password_solvers);
  const missing_solvers: string[] = [];
  const printed_missing_solvers: string[] = [];

  const files = ns.ls(ns.getHostname());
  for (const file of files) {
    if (/\.cache/.test(file)) {
      ns.tprintf("%s", file);
      ns.dnet.openCache(file);
    }
  }

  while (true) {
    const nearby_servers = ns.dnet.probe();

    for (const dark_net_server of nearby_servers) {
      const details = ns.dnet.getServerDetails(dark_net_server);
      if (!details.isConnectedToCurrentServer || !details.isOnline) {
        continue;
      }

      if (!solver_models.includes(details.modelId)) {
        if (!missing_solvers.includes(details.modelId) && !printed_missing_solvers.includes(details.modelId)) {
          missing_solvers.push(details.modelId);
          continue;
        }
      }

      if (debug_printing) ns.tprintf("%s: %i", dark_net_server.slice(0, 15).padEnd(15, " "), ns.getServer(dark_net_server).ramUsed);

      if (ns.dnet.isDarknetServer(dark_net_server)) {
        if (ns.getServer(dark_net_server).ramUsed - ns.dnet.getBlockedRam(dark_net_server) > 0) {
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
          ns.tprintf("solver for %s was unsuccessful on %s: %s", details.modelId, dark_net_server, password_attempts.join(", "));
        }
      }

    }
    ns.tprintf("%s", missing_solvers.join());
    missing_solvers.map((solver) => { printed_missing_solvers.push(solver); });
    missing_solvers.length = 0; // empty the array
    await ns.asleep(5_000);
  }
}

function desk_memo(auth_details: DarknetServerDetails): RegExpMatchArray {
  const re = new RegExp(`\\d{${auth_details.passwordLength}}`);
  const results = auth_details.passwordHint.match(re);
  if (results != null) {
    return results;
  }
  throw "could not find string in desk_memo hint";
}

function cloud_blare(auth_details: DarknetServerDetails): string[] {
  const numbers = auth_details.data.match(/\d+/g);
  if (numbers) {
    return [numbers.join("")];
  }
  throw "missing numbers in data";
}

function fresh_install(auth_details: DarknetServerDetails): string[] {
  const possible_passwords = ["password", "default", "admin", "0000", "1234", "12345"];
  const filtered_passwords = possible_passwords.filter(guess => guess.length == auth_details.passwordLength);
  if (!filtered_passwords.length) console.log();
  return filtered_passwords;
}

function overflow(auth_details: DarknetServerDetails): string[] {
  const overflow_password = ["11".repeat(auth_details.passwordLength)];
  return overflow_password;
}
