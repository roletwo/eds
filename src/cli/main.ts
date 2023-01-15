import Table from 'cli-table';
import yargs, { Argv } from 'yargs';
import { cut, calc_min, n } from '../lib/eds/eds';

export const cli = yargs
  .command({
    command: 'min <share> <member> <ratio>',
    describe: 'Calculate minimal member share',
    builder(argv: Argv<any>) {
      return argv
        .options({
          no_rounding: {
            type: 'boolean',
            desc: 'No rounding shares',
          },
          dp: {
            type: 'number',
            desc: 'Decimal places to keep in no-rounding mode',
          },
        })
        .positional('share', {
          describe: 'Total shares',
          type: 'number',
        })
        .positional('member', {
          describe: 'Total members to split shares',
          type: 'number',
        })
        .positional('ratio', {
          describe: "How many times a member's share is greater than next member's",
          type: 'number',
        });
    },
    handler({ share, member, ratio, no_rounding, dp }: any) {
      const r = calc_min({ share, member, ratio, round_fn: no_rounding ? false : undefined, dp });
      console.info(r);
    },
  })
  .command({
    command: 'cut <share> <member> <ratio>',
    describe: 'Calculate all member shares as a list',
    builder(argv: Argv<any>) {
      return argv
        .options({
          no_rounding: {
            type: 'boolean',
            desc: 'No rounding shares',
          },
          dp: {
            type: 'number',
            desc: 'Decimal places to keep in no-rounding mode',
          },
          pretty: {
            type: 'boolean',
            desc: 'Pretty print',
          },
        })
        .positional('share', {
          describe: 'Total shares',
          type: 'number',
        })
        .positional('member', {
          describe: 'Total members to split shares',
          type: 'number',
        })
        .positional('ratio', {
          describe: "How many times a member's share is greater than next member's",
          type: 'number',
        });
    },
    handler({ share, member, ratio, no_rounding, dp, pretty }: any) {
      const list = cut({ share, member, ratio, round_fn: no_rounding ? false : undefined, dp });
      const sum = list.reduce((a, b) => a.add(b), n(0)).toDP(dp);
      const crumb = n(share).minus(sum).toDP(dp);
      if (pretty) {
        const table_info = new Table({
          head: ['Sum', 'Crumb'],
          rows: [[sum.toString(), crumb.toString()]],
        });

        const table_list = new Table({
          head: ['Ranking', 'Shares'],
          rows: list.map((it, i) => [(i + 1).toString(), it.toString()]),
        });

        console.info('Info');
        console.info(table_info.toString());
        console.info('List');
        console.info(table_list.toString());
      } else {
        console.info(JSON.stringify({ list, sum, crumb }, null, 2));
      }
    },
  })
  .demandCommand();
