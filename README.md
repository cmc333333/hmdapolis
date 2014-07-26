     /$$   /$$ /$$      /$$ /$$$$$$$   /$$$$$$  /$$$$$$$   /$$$$$$  /$$       /$$$$$$  /$$$$$$ 
    | $$  | $$| $$$    /$$$| $$__  $$ /$$__  $$| $$__  $$ /$$__  $$| $$      |_  $$_/ /$$__  $$
    | $$  | $$| $$$$  /$$$$| $$  \ $$| $$  \ $$| $$  \ $$| $$  \ $$| $$        | $$  | $$  \__/
    | $$$$$$$$| $$ $$/$$ $$| $$  | $$| $$$$$$$$| $$$$$$$/| $$  | $$| $$        | $$  |  $$$$$$ 
    | $$__  $$| $$  $$$| $$| $$  | $$| $$__  $$| $$____/ | $$  | $$| $$        | $$   \____  $$
    | $$  | $$| $$\  $ | $$| $$  | $$| $$  | $$| $$      | $$  | $$| $$        | $$   /$$  \ $$
    | $$  | $$| $$ \/  | $$| $$$$$$$/| $$  | $$| $$      |  $$$$$$/| $$$$$$$$ /$$$$$$|  $$$$$$/
    |__/  |__/|__/     |__/|_______/ |__/  |__/|__/       \______/ |________/|______/ \______/ 

# HMDApolis [![Build Status](https://secure.travis-ci.org/cfpb/hmdapolis.png?branch=master)](http://travis-ci.org/cfpb/hmdapolis)

HMDApolis (pronounced *hum-dapolis*) is a two-player turn-based strategy game utilizing live [HMDA data](http://www.consumerfinance.gov/hmda/). It was created by [@cmc333333](https://github.com/cmc333333), [@contolini](https://github.com/contolini) and [@himedlooff](https://github.com/himedlooff) during a February 2013 weekend hackathon at the [Consumer Financial Protection Bureau](http://www.consumerfinance.gov/). Art is by [@duelj](https://github.com/duelj).

![hmdapolis screenshot](http://i.imgur.com/npLv0cr.png)

## How to play

Head over to http://cfpb.github.io/hmdapolis. A board will be randomly generated on page load.

At the start of each turn, a profile is randomly generated for the current player and is shown on the left side of the screen. The profile consists of a year, income and regulatory agency. The current player clicks a mortgage (dollar amount in a hex title) that they think will be approved given the details of their profile and the city adjacent to the clicked mortgage. [CFPB's HMDA API](https://api.consumerfinance.gov/data/hmda/slice/hmda_lar) is queried to determine the likelihood of the mortgage being approved. If at least 51% of similar real-world mortgages were approved, the player wins that tile. Otherwise, the tile is lost. Play continues to Player #2.

The game ends after all tiles have been won or lost. The player who has "captured" the most cities by having the most won tiles touching it wins the game.

## Contributing

1. Install [Node](http://nodejs.org/) and [Grunt](http://gruntjs.com/).
1. `git clone git@github.com:cfpb/hmdapolis.git`
1. `cd hmdapolis`
1. `npm install` to download dependencies.
1. `grunt build` to build everything.
1. `grunt` will start a local server and watch for file changes.

## License

The project is in the public domain within the United States, and
copyright and related rights in the work worldwide are waived through
the [CC0 1.0 Universal public domain dedication](http://creativecommons.org/publicdomain/zero/1.0/).

All contributions to this project will be released under the CC0
dedication. By submitting a pull request, you are agreeing to comply
with this waiver of copyright interest.

Software source code previously released under an open source license and then modified by CFPB staff is considered a "joint work" (see 17 USC § 101); it is partially copyrighted, partially public domain, and as a whole is protected by the copyrights of the non-government authors and must be released according to the terms of the original open-source license.

For further details, please see: http://www.consumerfinance.gov/developers/sourcecodepolicy/