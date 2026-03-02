type LogTag = 'CLI' | 'Server' | 'Livereload' | 'Announcement' | 'Agentation';

class Logger {
  private silent = false;

  setSilent(silent: boolean): void {
    this.silent = silent;
  }

  showLogo(): void {
    if (this.silent) {
      return;
    }

    import('chalk').then((module) => module.default).then(chalk => {
      const teal = chalk.hex('#0d9488');
      console.log(teal(`
  _                                                _
 | |__  _ __ _____      _____  ___ _ __ ___   __ _ _ __| | __
 | '_ \\| '__/ _ \\ \\ /\\ / / __|/ _ \\ '_ \` _ \\ / _\` | '__| |/ /
 | |_) | | | (_) \\ V  V /\\__ \\  __/ | | | | | (_| | |  |   <
 |_.__/|_|  \\___/ \\_/\\_/ |___/\\___|_| |_| |_|\\__,_|_|  |_|\\_\\

 browsemark — browse and annotate your docs
`));
    });
  }

  log(tag: LogTag, message: string, ...args: unknown[]): void {
    if (this.silent) {
      return;
    }
    this.getTagColor(tag)
      .then(chalk => {
        const paddedTag = tag.padEnd(12, ' '); // Pad to 12 characters
        const tagColored = chalk(` ${paddedTag} `);

        const formattedMessage = message.replace(/(https?:\/\/\S+)/g, (url) => {
          // Apply OSC 8 for clickable link and chalk for styling
          return `\x1b]8;;${url}\x1b\\${url}\x1b]8;;\x1b\\`;
        });

        console.log(`${tagColored} ${formattedMessage}`, ...args);
      });
  }

  error(message: string, ...args: unknown[]): void {
    import('chalk')
      .then((module) => module.default)
      .then(chalk => { console.error(chalk.bgRed.black(' Error'.padEnd(14, ' ')), message, ...args); });
  }

  private getTagColor(tag: LogTag) {
    return import('chalk').then((module) => module.default).then(chalk => {
      switch (tag) {
        case 'CLI':
          return chalk.bgGreen.black;
        case 'Server':
          return chalk.bgCyan.black;
        case 'Livereload':
          return chalk.bgBlue.black;
        case 'Announcement':
          return chalk.bgYellow.black;
        case 'Agentation':
          return chalk.bgMagenta.black;
        default:
          return chalk.bgWhite.black;
      }
    });
  }
}

export const logger = new Logger();
