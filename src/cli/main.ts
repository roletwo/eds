import Table from 'cli-table';
import yargs, { Argv } from 'yargs';
import { calc_min, cut, poll_cut } from '../lib/eds/eds';
import { n } from '../lib/utility/math';

export const cli = yargs
  .command({
    command: 'calc_min <share> <member> <ratio>',
    describe: 'Calculate minimal member share',
    builder(argv: Argv<any>) {
      return argv
        .options({
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
      const r = calc_min({ share, member, ratio, dp });
      console.info(r);
    },
  })
  .command({
    command: 'cut <share> <member> <ratio>',
    describe: 'Calculate all member shares as a list',
    builder(argv: Argv<any>) {
      return argv
        .options({
          dp: {
            type: 'number',
            desc: 'Decimal places to keep in no-rounding mode',
          },
          pretty: {
            type: 'boolean',
            desc: 'Pretty print',
          },
          verbose: {
            type: 'boolean',
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
    handler({ share, member, ratio, no_rounding, dp, pretty, verbose }: any) {
      const list = cut({ share, member, ratio, dp });
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

        if (verbose) {
          console.info('Info');
          console.info(table_info.toString());
          console.info('List');
          console.info(table_list.toString());
        } else {
          console.info(table_list.toString());
        }
      } else {
        console.info(JSON.stringify({ list, sum, crumb }, null, 2));
      }
    },
  })
  .command({
    command: 'poll_cut <share> <member> <ratio>',
    describe: 'Calculate all member shares as a list from a poll list',
    builder(argv: Argv<any>) {
      return argv
        .options({
          dp: {
            type: 'number',
            desc: 'Decimal places to keep in no-rounding mode',
          },
          pretty: {
            type: 'boolean',
            desc: 'Pretty print',
          },
          poll: {
            type: 'array',
            desc: 'Vote count of each member',
          },
          base_vote: {
            type: 'number',
            desc: 'Vote count, a member will receive base share if his votes is less than this value',
          },
          base_share: {
            type: 'number',
            desc: 'Base share, even members with 0 votes will get this amount of shares',
          },
          verbose: {
            type: 'boolean',
          },
        })
        .demandOption(['poll', 'base_vote', 'base_share'])
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
    handler({ share, member, ratio, no_rounding, dp, pretty, poll, base_share, base_vote, verbose }: any) {
      const list = poll_cut(
        { poll, base_share, base_vote },
        {
          share,
          member,
          ratio,
          dp,
        },
      );
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

        if (verbose) {
          console.info('Info');
          console.info(table_info.toString());
          console.info('List');
          console.info(table_list.toString());
        } else {
          console.info(table_list.toString());
        }
      } else {
        console.info(JSON.stringify({ list, sum, crumb }, null, 2));
      }
    },
  })
  .demandCommand();
