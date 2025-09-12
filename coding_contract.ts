import { NS, AutocompleteData } from "@ns";
import { connect_to_server, get_servers } from "library";

export async function main(ns: NS) {
  const args = ns.args;
  if (args.length > 0) {
    connect_to_server(ns, args[0].toString())
  } else {
    const contract_servers = find_contract_servers(ns)
    for (const server of contract_servers) {
      for (const contract_filename of ns.ls(server, "cct")) {
        const contract_type = ns.codingcontract.getContractType(contract_filename, server);
        const contract_data = ns.codingcontract.getData(contract_filename, server);
        let answer;
        let solved = false;
        switch (contract_type) {
          case "Unique Paths in a Grid I":
            answer = solver_grid_i(contract_data[0], contract_data[1])
            solved = true;
            break;

          case "Find Largest Prime Factor":
            answer = solver_largest_prime_factor(contract_data);
            solved = true;
            break;

          case "Encryption II: Vigenère Cipher":
            answer = solver_encryption_ii(contract_data[0], contract_data[1]);
            solved = true;
            break;

          default:
            ns.tprintf("Could not find solver for: %s on %s", contract_type, server)
            break;
        }
        if (solved) {
          const contract_message = ns.codingcontract.attempt(answer, contract_filename, server)
          ns.tprintf("Success for %s on %s: %s", contract_type, server, contract_message)
        }
      }
    }
    ns.tprintf("%s", find_contract_servers(ns).join(", "))
  }
}

export function autocomplete(data: AutocompleteData, args: string[]) {
  return data.servers
}

function find_contract_servers(ns: NS) {
  const servers = get_servers(ns);
  const contract_servers = [];
  for (const server of servers) {
    if (ns.ls(server, "cct").length > 0) {
      contract_servers.push(server)
    }
  }
  return contract_servers
}



function solver_grid_i(length: number, width: number): number {
  if (length == 1 || width == 1)
    return 1;

  return solver_grid_i(length - 1, width)
    + solver_grid_i(length, width - 1);
}

function solver_largest_prime_factor(number: number) {
  const factors: number[] = [];
  let divisor = 2;
  while (number > 1) {
    while (number % divisor == 0) {
      factors.push(divisor)
      number = number / divisor
    }
    divisor += 1;
    if (divisor * divisor > number) {
      if (number > 1) { factors.push(number) }
      break
    }
  }
  return factors.reduce((a, b) => Math.max(a, b))
}

function solver_encryption_ii(plaintext: string, keyword: string): string {
  const plaintext_array = plaintext.split("");
  const keyword_array = keyword.split("");
  const alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
  let encrypted_string = "";
  for (const character_index in plaintext_array) {
    const plaintext_character = plaintext_array[character_index]
    const keyword_character = keyword_array[Number(character_index) % keyword_array.length]
    const plaintext_index = alphabet.indexOf(plaintext_character);
    const keyword_index = alphabet.indexOf(keyword_character);
    encrypted_string = encrypted_string.concat(alphabet[(plaintext_index + keyword_index) % alphabet.length])
  }
  return encrypted_string;
}
