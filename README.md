## BH Bot

### Requirements

- Bluestack
- Recommended Bluestack Configurations
  -  Display Resolution: Ultrawide
  -  2560x1080
  -  160 DPI(Low)
  -  Interface scaling 100%
 
- npm install
- npm start  -- WINDOW_TITLE LANGUAGE HEIGHT TITLE_HEIGHT

### Parameters

- WINDOW_TITLE: Window title
  - Bluestack App Player
  - Android 11
  - Android 13 (Beta)
- LANGUAGE: Game language (defaul eng)
  - eng
- HEIGHT: Window height (default 1080)
  - 1080
  - 720
  - 540
- TITLE_HEIGHT: Window title bar height (default 32)
  - 32

### Example commands

- Check text.csv for language supports
- For English Exmple:
  - npm start -- "Bluestack App Player"
  - npm start -- "Bluestack App Player" eng 720
  - npm start -- "Android 13 (Beta)" eng 540 32
- For Chinese simplified
  - npm start -- "Bluestack App Player" chi_sim 720
- Note, Chinese not fully supported, need code adjustments

## :sparkles: Current Features:

- :earth_africa: Language: English support (current).
- :white_check_mark: Auto-Accept: Instantly joins invites for Mines-10, Bug Nest-10, and Snow Mountain-10.
- :shield: Blacklist: Automatically declines Rank and Guild Attack invites.
- :arrows_counterclockwise: Auto-Reconnect: Detects connection issues and tries to jump back in.
- :gift: Auto-Loot: Automatically collects Chests and Ballistar rewards.

## :rocket: Coming Soon (To-Do):

- :broom: Square trash collection.
- :pencil: Square task automation.
- :globe_with_meridians: Multi-language & dynamic resolution support.
