import { AsciiTable3 } from "ascii-table3";
import chalk from "chalk";
import { Collection, REST, Routes } from "discord.js";
import { Client } from "../struct/client.js";
import CommandBuilder from "../struct/command.js";
import { getColor } from "../utils/color.js";
import { find, readFiles } from "../utils/file.js";

export class CommandService {
  readonly commands = new Collection<string, CommandBuilder>();

  constructor(protected client: Client) { }

  async _initialize() {
    const table = new AsciiTable3(chalk.bold('Typy')).setHeading('Command', 'Status').setAlignCenter(2).setStyle('unicode-round');
    this.commands.clear();
    const paths = await readFiles(`${process.cwd()}/dist/esm/commands`);
    await Promise.all(
      paths.map(async (path) => {
        const command: CommandBuilder = await find(path).catch(() => { });
        this.commands.set(command.name, command);
        table.addRow(command.name, chalk.hex(getColor('green'))('CONNECTED'));
      })
    ).catch((e) => {
      console.log(e);
    });
    const rest = new REST({ version: '10' }).setToken(this.client.token!);
    const commands: any[] = [];
    this.commands.forEach((command) => {
      commands.push(command.toJSON());
    })

    await rest.put(Routes.applicationGuildCommands(this.client.user!.id, process.env.GUILD_ID!), {
      body: commands
    }).catch((e) => {
      console.log(e);
    })
    return console.log(table.toString());
  }
}
