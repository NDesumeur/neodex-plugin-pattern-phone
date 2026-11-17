# Pattern

Write a regular expression and watch it find its matches live in your text, with every part of the pattern explained in plain words.

*Version française : [README.md](README.md)*

![Pattern](screenshots/1.jpg)

## Phone version

- Same screen as on PC, in one column: pattern, flags, text, matches, then the explanation below.
- In the cheat sheet, **tap** an item to insert it at the cursor.
- Same saved patterns as on PC (same id `neodex.pattern`).

## Test a pattern

- Type the pattern between the two `/` and your text below: matches are highlighted as you type (alternating colours to tell them apart; an empty match is a small pink bar).
- **Flags** `g i m s u y`: every match, ignore case, `^`/`$` on every line, dot matches line breaks, Unicode, sticky. Hover a flag for its explanation.
- An invalid pattern is reported with the exact error.
- **A runaway pattern** (nested repetitions like `(a+)+`) is stopped after one second: the search runs separately, NeoDex never freezes.

## Understand

- **Explanation**: the pattern split piece by piece, with group nesting ("a digit — 2 to 4 times", "checks that what follows is NOT…").
- **Details**: every match with its position and its groups, numbered and named.
- **Cheat sheet**: the 24 most useful constructs; a click inserts them at the cursor. Plus 8 ready examples: e-mail, date, French phone number, link, colour, IPv4, repeated word, decimal numbers.

## Replace

The **Replace with** field accepts `$1`, `$<name>`, `$&` (the whole match): the replaced text is shown below, and **Copy the result** puts it on the clipboard.

## My patterns

Keep your patterns with a name, their flags, their test text and their replacement (100 at most). They live in the plugin's folder. Permission: `storage` only.


