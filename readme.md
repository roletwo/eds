# Exponential Distribute Share

```text
eds <command>

Commands:
  eds poll_cut <share> <member> <ratio>  Calculate all member shares as a list
                                         from a poll list
  eds cut <share> <member> <ratio>       Calculate all member shares as a list
  eds calc_min <share> <member> <ratio>  Calculate minimal member share

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]

Examples:
  Cut 10000 shares into 10 peaces with      eds cut 10000 10 1.1
  ratio of 1.1
  Cut 10000 shares into 10 peaces with      eds cut --pretty 10000 10 1.1
  ratio of 1.1 (pretty print)
  Calc 10 member shares from their votes    eds poll_cut 10000 10 1.1 --poll 10
                                            9 8 7 6 5 4 3 2 1 --base_vote 6
                                            --base_share 10
  Calc 10 member shares from their votes    eds poll_cut 10000 10 1.1 --pretty
  (pretty print)                            --poll 10 9 8 7 6 5 4 3 2 1
                                            --base_vote 6 --base_share 10
  Calc 10 member shares from their votes    eds poll_cut 10000 10 1.1 --poll 10
  (with same votes exists)                  10 8 8 6 5 4 3 2 1 --base_vote 6
                                            --base_share 10
```
