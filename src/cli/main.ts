import Table from 'cli-table';
import yargs, { Argv } from 'yargs';
import { calc_min, cut, poll_cut, rank } from '../lib/eds/eds';
import { n } from '../lib/utility/math';

export const cli = yargs
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
          titles: {
            type: 'array',
            desc: 'Member names or titles, same order of {member}',
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
    handler({ share, member, ratio, no_rounding, dp, pretty, poll, titles, base_share, base_vote, verbose }: any) {
      const list = poll_cut(
        { poll, base_share, base_vote },
        {
          share,
          member,
          ratio,
          dp,
        },
      );
      titles = titles || [];
      const sum = list.reduce((a, b) => a.add(b), n(0)).toDP(dp);
      const crumb = n(share).minus(sum).toDP(dp);
      if (pretty) {
        const table_info = new Table({
          head: ['Sum', 'Crumb'],
          rows: [[sum.toString(), crumb.toString()]],
        });

        const head = ['Votes', 'Ranking', 'Shares'];
        if (titles.length) {
          head.unshift('Title');
        }

        const list_rank = rank(list, poll, titles, base_vote);

        const rows = list_rank.map((it) => {
          const i = it.i;
          const row = [it.vote.toString(), it.ranking.toString(), it.share.toString()];
          if (titles.length) {
            row.unshift(titles[i] ?? '-');
          }
          return row;
        });
        const table_list = new Table({
          head,
          rows,
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
        console.info(JSON.stringify({ list, verbose: { sum, crumb } }, null, 2));
      }
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
        console.info(JSON.stringify({ list, verbose: { sum, crumb } }, null, 2));
      }
    },
  })
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
  .example(`Cut 10000 shares into 10 peaces with ratio of 1.1`, `eds cut 10000 10 1.1`)
  .example(`Cut 10000 shares into 10 peaces with ratio of 1.1 (pretty print)`, `eds cut --pretty 10000 10 1.1`)
  .example(
    `Cut 10000 shares for 10 members based on their votes`,
    `eds poll_cut 10000 10 1.1 --poll 10 9 8 7 6 5 4 3 2 1 --base_vote 6 --base_share 10`,
  )
  .example(
    `Cut 10000 shares for 10 members based on their votes (pretty print)`,
    `eds poll_cut 10000 10 1.1 --pretty --poll 10 9 8 7 6 5 4 3 2 1 --base_vote 6 --base_share 10`,
  )
  .example(
    `Cut 10000 shares for 10 members based on their votes (with same votes exists)`,
    `eds poll_cut 10000 10 1.1 --poll 10 10 8 8 6 5 4 3 2 1 --base_vote 6 --base_share 10`,
  )
  .demandCommand();
